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
  headers: string[];
  sampleRaw: any;
  count: number;
  invoicePresentRate: number;
  vatAccountRatio: number;
};

export async function parseAnyFile(file: File) {
  const name = file.name.toLowerCase();
  const text = await file.text();

  let rowsRaw: any[] = [];
  let kind: ParseMeta['kind'] = 'unknown';
  let headers: string[] = [];

  // -------- XML FIRST (fixes mis-detection of SpreadsheetML) --------------
  if (name.endsWith('.xml') || text.trim().startsWith('<')) {
    // Detect Excel SpreadsheetML (XML Spreadsheet 2003)
    const isSpreadsheetML =
      /<Workbook\b[^>]*schemas-microsoft-com:office:spreadsheet/i.test(text) ||
      /xmlns(?::\w+)?=["']urn:schemas-microsoft-com:office:spreadsheet["']/i.test(text) ||
      /<Worksheet\b/i.test(text) && /<Table\b/i.test(text) && /<Row\b/i.test(text);

    if (isSpreadsheetML) {
      kind = 'xml';
      rowsRaw = parseSpreadsheetML(text);
      headers = rowsRaw.length ? Object.keys(rowsRaw[0]) : [];
    } else {
      kind = 'xml';
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
      const xml = parser.parse(text);
      const arrays = findArrays(xml);
      rowsRaw = arrays.length ? arrays.sort((a, b) => scoreArray(b) - scoreArray(a))[0] : [];
      headers = rowsRaw.length ? Object.keys(rowsRaw[0]) : [];
    }
  }
  // -------- CSV (fallback) -------------------------------------------------
  else if (name.endsWith('.csv') || (/\n/.test(text) && /,/.test(text))) {
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
  // -------- Unknown --------------------------------------------------------
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

/* ============================ Helpers ==================================== */

// naive CSV split (handles quoted fields)
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

// Find all arrays of objects within an XML object
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

// Prefer arrays that look "tabular"
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

// Normalize one record into our canonical shape
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

/* -------- SpreadsheetML (Excel XML 2003) parser -------------------------- */

function parseSpreadsheetML(text: string): any[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    preserveOrder: false,
  });
  const xml = parser.parse(text);

  // Workbook / Worksheet / Table structure (namespace tolerant)
  const wb = (xml as any).Workbook || (xml as any)['ss:Workbook'] || xml;
  const worksheets = wb?.Worksheet
    ? (Array.isArray(wb.Worksheet) ? wb.Worksheet : [wb.Worksheet])
    : [];
  const ws = worksheets[0];
  const table = ws?.Table || ws?.['ss:Table'] || (ws as any)?.table;
  const rows = (table?.Row || table?.row || []) as any[];

  if (!rows || !rows.length) return [];

  // Convert SpreadsheetML rows to arrays of cell values (handle 1-based ss:Index)
  const rowCells: string[][] = rows.map((row: any) => {
    const cells = row?.Cell || row?.cell || [];
    const arr = Array.isArray(cells) ? cells : [cells];

    let pos = 0;
    const values: string[] = [];
    for (const c of arr) {
      if (!c) continue;
      const idxAttr = c.Index ?? c['ss:Index'];
      if (idxAttr) {
        const idx = Number(idxAttr);
        if (Number.isFinite(idx) && idx > 0) {
          while (pos < idx - 1) { values[pos++] = ''; }
        }
      }
      const d = c.Data ?? c.data;
      let v = '';
      if (typeof d === 'string') v = d;
      else if (d && typeof d === 'object') {
        v = (d['#text'] ?? d._ ?? '').toString();
      }
      values[pos++] = v;
    }
    return values;
  });

  // Header = first non-empty row
  const headerRow = rowCells.find(r => r?.some(x => (x || '').trim() !== '')) || [];
  const headers = headerRow.map(h => (h || '').trim());

  // Data = remaining rows
  const dataRows = rowCells.slice(rowCells.indexOf(headerRow) + 1);

  const out: any[] = [];
  for (const arr of dataRows) {
    if (!arr || !arr.some(x => (x || '').trim() !== '')) continue;
    const obj: any = {};
    headers.forEach((h, i) => { if (h) obj[h] = arr[i] ?? ''; });
    out.push(obj);
  }
  return out;
}
