import type { NormalizedRow } from './parse';

export type RateMap = {
  std20?: string; red5?: string; red4?: string; zero?: string; exempt?: string; os?: string;
  rcGoods?: string; rcServices?: string; sales20?: string; funding?: string;
};

export type ReconIssue = {
  invoice: string;
  supplier?: string;
  costTotal: number;
  expectedVat: number;
  claimedVat: number;
  flags: string[];
  error: string;
};

export type ReconResult = {
  expectedTotal: number;
  claimedTotal: number;
  variance: number;
  countInvoices: number;
  countMatched: number;
  mismatched: string[];
  missingInCost: string[];
  missingInVat: string[];
  issues: ReconIssue[];
  vatByInvoice: Record<string, number>;
  flatCostLines: { invoice: string; supplier?: string; account: string; net: number; ff3?: string }[];
};

export function reconcile(costParsed: {rows: NormalizedRow[]}, vatParsed: {rows: NormalizedRow[]}, map: RateMap): ReconResult {
  const eq = (a?: string, b?: string) =>
    !!a && !!b && a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();

  const costRows = costParsed.rows.filter(r => r.invoice);
  const vatRows  = vatParsed.rows.filter(r => r.invoice && (r.account||'').toString().startsWith('7501-'));

  const costByInv = group(costRows, r => r.invoice);
  const vatByInv: Record<string, number> = {};
  for (const r of vatRows) {
    vatByInv[r.invoice] = (vatByInv[r.invoice] || 0) + (r.vat || 0);
  }

  // Expected per invoice
  const expByInv: Record<string, {expected: number, costTotal: number, supplier?: string, flags: Set<string>}> = {};
  for (const inv of Object.keys(costByInv)) {
    const lines = costByInv[inv];
    const flags = new Set<string>();
    let expected = 0, costTotal = 0, supplier: string | undefined;

    for (const L of lines) {
      if (L.supplier) supplier = L.supplier;
      const net = L.net || 0;
      const f = (L.ff3 || '').toString();
      if (f) flags.add(f);

      costTotal += net;

      if (eq(f, map.std20)) expected += net * 0.20;
      else if (eq(f, map.red5)) expected += net * 0.05;
      else if (eq(f, map.red4)) expected += net * 0.04;
      // 0/exempt/os/funding/rc/sales → expected 0 reclaim
    }
    expByInv[inv] = { expected: round2(expected), costTotal: round2(costTotal), supplier, flags };
  }

  const invoices = Array.from(new Set([...Object.keys(expByInv), ...Object.keys(vatByInv)]));
  const issues: ReconIssue[] = [];
  let expectedTotal = 0, claimedTotal = 0;
  let countMatched = 0;
  const mismatched: string[] = [];
  const missingInCost: string[] = [];
  const missingInVat: string[] = [];

  for (const inv of invoices) {
    const exp = expByInv[inv]?.expected ?? 0;
    const cst = expByInv[inv]?.costTotal ?? 0;
    const sup = expByInv[inv]?.supplier;
    const flg = Array.from(expByInv[inv]?.flags || []);
    const clm = round2(vatByInv[inv] ?? 0);

    expectedTotal += exp;
    claimedTotal += clm;

    const diff = round2(exp - clm);
    const tol = 0.01;

    if (!(inv in expByInv)) {
      issues.push({ invoice: inv, supplier: sup, costTotal: 0, expectedVat: 0, claimedVat: clm, flags: [], error: 'VAT claimed but no matching cost lines' });
      missingInCost.push(inv);
      continue;
    }
    if (!(inv in vatByInv)) {
      issues.push({ invoice: inv, supplier: sup, costTotal: cst, expectedVat: exp, claimedVat: 0, flags: flg, error: 'No VAT claimed for this invoice' });
      missingInVat.push(inv);
      continue;
    }
    if (Math.abs(diff) > tol) {
      mismatched.push(inv);
      const rateHint = flg.length ? ` Flags: ${flg.join(', ')}` : '';
      issues.push({ invoice: inv, supplier: sup, costTotal: cst, expectedVat: exp, claimedVat: clm, flags: flg, error: `Mismatch: expected £${exp.toFixed(2)} vs claimed £${clm.toFixed(2)}.${rateHint}` });
    } else {
      countMatched++;
    }

    // Flag if expected is 0 but claim > 0
    if (exp === 0 && clm > tol) {
      issues.push({ invoice: inv, supplier: sup, costTotal: cst, expectedVat: exp, claimedVat: clm, flags: flg, error: 'Claimed VAT with 0%/non-reclaimable flags' });
    }
  }

  return {
    expectedTotal: round2(expectedTotal),
    claimedTotal: round2(claimedTotal),
    variance: round2(expectedTotal - claimedTotal),
    countInvoices: invoices.length,
    countMatched,
    mismatched,
    missingInCost,
    missingInVat,
    issues,
    vatByInvoice: vatByInv,
    flatCostLines: costRows.map(r => ({ invoice: r.invoice, supplier: r.supplier, account: r.account, net: r.net || 0, ff3: r.ff3 }))
  };
}

function group<T>(rows: T[], key: (r: T) => string) {
  const out: Record<string, T[]> = {};
  for (const r of rows) {
    const k = key(r) || '';
    (out[k] ||= []).push(r);
  }
  return out;
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
