// lib/reconcile.ts
import type { NormalizedRow } from './parse';

export type RateMap = {
  std20: string; red5: string; red4: string; zero: string; exempt: string;
  os: string; rcGoods: string; rcServices: string; sales20: string; funding: string;
};

export type ReconResult = {
  expectedTotal: number;
  claimedTotal: number;
  variance: number;
  countInvoices: number;
  countMatched: number;
  missingInCost: string[];
  missingInVat: string[];
  mismatched: { invoice: string; expectedVat: number; claimedVat: number; supplier?: string; error: string; costTotal: number; flags: string[] }[];
  issues: any[];
  vatByInvoice: Record<string, number>;
  flatCostLines: NormalizedRow[];
};

/**
 * Reconciles VAT claimed vs expected.
 * - costFile gives us expected VAT (based on FF3 mapping)
 * - vatFile gives us claimed VAT (explicit vat field)
 */
export function reconcile(costParsed: { rows: NormalizedRow[] }, vatParsed: { rows: NormalizedRow[] }, mapping: RateMap): ReconResult {
  const costRows = costParsed?.rows || [];
  const vatRows = vatParsed?.rows || [];

  // --- Build VAT claimed map ---
  const vatByInvoice: Record<string, number> = {};
  for (const row of vatRows) {
    const inv = row.invoice?.trim().toUpperCase();
    if (!inv) continue;
    if (row.vat !== undefined && !isNaN(row.vat)) {
      vatByInvoice[inv] = (vatByInvoice[inv] || 0) + row.vat;
    }
  }

  // --- Compute expected VAT from cost file ---
  const expectedByInvoice: Record<string, number> = {};
  const rateMap: Record<string, number> = {};

  const set = (k: string, v: string) => { if (v) rateMap[v] = rateFor(k); };
  const rateFor = (k: string) => {
    if (k === 'std20') return 0.2;
    if (k === 'red5') return 0.05;
    if (k === 'red4') return 0.04;
    return 0.0;
  };
  set('std20', mapping.std20);
  set('red5', mapping.red5);
  set('red4', mapping.red4);

  const flatCostLines: NormalizedRow[] = [];

  for (const row of costRows) {
    const inv = row.invoice?.trim().toUpperCase();
    if (!inv) continue;
    const ff3 = row.ff3?.trim() || '';
    const rate = rateMap[ff3] ?? 0;
    const net = row.net ?? 0;
    if (net && rate) {
      expectedByInvoice[inv] = (expectedByInvoice[inv] || 0) + net * rate;
    }
    flatCostLines.push(row);
  }

  // --- Reconcile ---
  const allInvoices = new Set([...Object.keys(expectedByInvoice), ...Object.keys(vatByInvoice)]);
  const issues: any[] = [];
  const missingInCost: string[] = [];
  const missingInVat: string[] = [];
  const mismatched: any[] = [];

  let totalExpected = 0, totalClaimed = 0, matched = 0;

  for (const inv of allInvoices) {
    const expected = expectedByInvoice[inv] ?? 0;
    const claimed = vatByInvoice[inv] ?? 0;
    totalExpected += expected;
    totalClaimed += claimed;

    if (expected && claimed) {
      matched++;
      const diff = Math.abs(expected - claimed);
      if (diff > 0.01) {
        mismatched.push({
          invoice: inv,
          expectedVat: expected,
          claimedVat: claimed,
          error: `Mismatch: expected £${expected.toFixed(2)}, claimed £${claimed.toFixed(2)}`,
          costTotal: expected / 0.2,
          flags: [],
        });
      }
    } else if (expected && !claimed) {
      missingInVat.push(inv);
      issues.push({ invoice: inv, error: 'Claim missing in VAT ledger', costTotal: expected / 0.2, expectedVat: expected, claimedVat: 0, flags: [] });
    } else if (!expected && claimed) {
      missingInCost.push(inv);
      issues.push({ invoice: inv, error: 'No matching cost ledger entry', costTotal: 0, expectedVat: 0, claimedVat: claimed, flags: [] });
    }
  }

  const variance = totalExpected - totalClaimed;

  return {
    expectedTotal: totalExpected,
    claimedTotal: totalClaimed,
    variance,
    countInvoices: allInvoices.size,
    countMatched: matched,
    missingInCost,
    missingInVat,
    mismatched,
    issues,
    vatByInvoice,
    flatCostLines,
  };
}
