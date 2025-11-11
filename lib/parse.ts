// lib/parse.ts
import { XMLParser } from 'fast-xml-parser';

export type NormalizedRow = {
  invoice: string;
  supplier?: string;
  account: string;
  net?: number;
  vat?: number;
  ff3?: string;
  raw?: any;
};

export type ParseMeta = {
  kind: 'csv' | 'xml' | 'unknown';
  headers: string[];          // detected header keys
  sampleRaw: any;             // first raw row (pre-normalization)
  count: number;              // total parsed rows
  invoicePresentRate: number; // % rows with an invoice id
  vatAccountRatio: number;    // % rows with account starting "7501-"
};

export async function parseAnyFile(file: File) {
  const name = file.name.toLowerCase();
  const text = await file.text();

  let rowsRaw: any[] = [];
  let kind: ParseMeta['kind'] = 'unknown';
  let headers: string[] = [];

  // --- CSV path -------------------------------------------------------------
  if (name.endsWith('.csv') || (text.includes('\n') && text.includes(','))) {
    kind = 'csv';
    const lines = text.split(/\r?\n/).filter(l => l !== '');
    const headerLine = lines.shift() || '';
    headers = headerLine.split(',').map(s => s.trim());
    rowsRaw = lines.map(line => {
      const parts = splitCsv(line);
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = parts[i]));
      return obj;
    });
  }
  // --- XML path -------------------------------------------------------------
  else if (name.endsWith('.xml') || text.trim().startsWith('<')) {
    kind = 'xml';
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const xml = parser.parse(text);
    const arrays = findArrays(xml);
    rowsRaw = arrays.length ? arrays.sort((a, b) => scoreArray(b) - scoreArray(a))[0] : [];
    headers = rowsRaw.length ? Object.keys(rowsRaw[0]) : [];
  }
  // --- Unknown --------------------------------------------------------------
  else {
    rowsRaw = [];
  }

  const rows: NormalizedRow[] = rowsRaw.map((r, i) => normalize(r, i));
  const count = rows.length;
  const invoicePresentRate = count ? rows.filter(r => r.invoice).length / count : 0;
  const vatAccountRatio = count ? rows.filter(r => (r.account || '').startsWith('7501-')).length / count : 0;

  return {
    file,
    rows,
    meta: {
      kind,
      headers,
      sampleRaw: rowsRaw[0],
      count,
      invoicePresentRate,
      vatAccountRatio,
    } as ParseMeta,
  };
}

/* ----------------------------- helpers ---------------------------------- */

function splitCsv(line: string) {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { q = !q; continue; }
    if (c === ',' && !q) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function findArrays(obj: any): any[] {
  const out: any[] = [];
  const visit = (o: any) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o) && o.length && typeof o[0] === 'object') out.push(o);
    for (const k of Object.keys(o)) visit(o[k]);
  };
  visit(obj);
  return out;
}

// Prefer arrays whose objects have table-ish keys (account/invoice/etc.)
function scoreArray(arr: any[]): number {
  let score = 0;
  for (const r of arr.slice(0, 50)) {
    const ks = Object.keys(r).map(k => k.toLowerCase());
    if (ks.some(k => k.includes('account') || k.includes('gl') || k.includes('nominal'))) score++;
    if (ks.some(k => k.includes('invoice') || k === 'doc' || k.includes('document'))) score++;
    if (ks.some(k => k.includes('vat') || k.includes('tax'))) score++;
  }
  return score;
}

function normalize(r: any, _idx: number): NormalizedRow {
  const lower = (k: string) => k.toLowerCase().replace(/\s+/g, '');
  const get = (cands: string[]) => {
    for (const k of Object.keys(r)) {
      const lk = lower(k);
      if (cands.some(c => lk.includes(c))) return r[k];
    }
    return undefined;
  };

  const invoiceVal = get([
    'invoice', 'invoiceno', 'invoicenumber', 'supplierinvoice',
    'supplierref', 'reference', 'ref', 'doc', 'document', 'documentno', 'voucher', 'transaction'
  ]);

  const supplierVal = get(['supplier', 'suppliername', 'vendor', 'vendorname', 'name']);

  const accountVal = get(['account', 'gl', 'glcode', 'nominal', 'code', 'glaccount']);

  const netRaw = get(['net', 'goods', 'amountnet', 'netamount', 'lineamount', 'amount', 'base']);
  const vatRaw = get(['vat', 'tax', 'vatr', 'vatamount', 'taxamount', 'vatvalue', 'taxvalue']);

  const ff3Val = get(['ff3', 'freefield3', 'ff-3', 'ff_3', 'flag']);

  const toNum = (v: any) => {
    if (v === undefined || v === null || v === '') return undefined;
    const s = v.toString().replace(/[^0-9\-\.\,]/g, '').replace(/,/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    invoice : (invoiceVal ?? '').toString().trim(),
    supplier: (supplierVal ?? '').toString().trim(),
    account : (accountVal ?? '').toString().trim(),
    net     : toNum(netRaw),
    vat     : toNum(vatRaw),
    ff3     : (ff3Val ?? '').toString().trim(),
    raw     : r,
  };
}
