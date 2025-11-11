// lib/parse.ts
import { XMLParser } from 'fast-xml-parser';

export type NormalizedRow = {
  invoice: string;
  supplier?: string;
  account: string;   // may be empty if not present in export
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
  invoicePresentRate: number; // % rows with an invoice id
  vatAccountRatio: number;    // % rows with account starting "7501-"
};

export type Parsed = Awaited<ReturnType<typeof parseAnyFile>>;

export async function parseAnyFile(file: File) {
  const name = file.name.toLowerCase();
  const text = await file.text();

  let rowsRaw: any[] = [];
  let kind: ParseMeta['kind'] = 'unknown';
  let headers: string[] = [];

  // -------- XML FIRST (handles SpreadsheetML correctly) --------------------
  if (name.endsWith('.xml') || text.trim().startsWith('<')) {
    const isSpreadsheetML =
      /<Workbook\b[^>]*schemas-microsoft-com:office:spreadsheet/i.test(text) ||
      /xmlns(?::\w+)?=["']urn:schemas-microsoft-com:office:spreadsheet["']/i.test(text) ||
      (/<Worksheet\b/i.test(text) && /<Table\b/i.test(text) && /<Row\b/i.test(text));

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

/**
 * SpreadsheetML (Excel XML 2003) → array of row objects using first non-empty row as headers.
 */
function parseSpreadsheetML(text: string): any[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    preserveOrder: false,
  });
  const xml = parser.parse(text);

  const wb = (xml as any).Workbook || (xml as any)['ss:Workbook'] || xml;
  const worksheets = wb?.Worksheet
    ? (Array.isArray(wb.Worksheet) ? wb.Worksheet : [wb.Worksheet])
    : [];
  const ws = worksheets[0];
  const table = ws?.Table || ws?.['ss:Table'] || (ws as any)?.table;
  const rows = (table?.Row || table?.row || []) as any[];

  if (!rows || !rows.length) return [];

  // Convert rows to arrays of values; respect 1-based ss:Index (sparse)
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

  // First non-empty row = headers
  const headerRow = rowCells.find(r => r?.some(x => (x || '').trim() !== '')) || [];
  const headers = headerRow.map(h => (h || '').trim());

  // Remaining rows = data
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

/* =========================== Normalization =============================== */

/**
 * Normalize SpreadsheetML AP export rows to our canonical shape.
 * - invoice: from "Invoice Number" (fallback "Ref Number")
 * - supplier: from "Vendor/Employee"
 * - net/vat:
 *    - if Distribution Description includes "VAT ON NNN", treat Amount as VAT and NNN as net base
 *    - otherwise Amount is treated as net
 * - ff3: from "FF3"
 * - account: empty (not present in this export)
 */
function normalize(r: any, _idx: number): NormalizedRow {
  const pick = (obj: any, keys: string[]) => {
    for (const k of Object.keys(obj)) {
      const lk = k.toLowerCase().trim();
      if (keys.some(t => lk === t || lk.includes(t))) return obj[k];
    }
    return undefined;
  };

  const rawInvoice =
    pick(r, ['invoice number', 'invoicenumber']) ??
    pick(r, ['ref number', 'refnumber', 'reference', 'ref']);

  const rawSupplier = pick(r, ['vendor/employee', 'vendor', 'supplier', 'suppliername', 'vendorname']);
  const rawAmount   = pick(r, ['amount', 'line amount', 'net amount', 'net']);
  const rawFF3      = pick(r, ['ff3', 'freefield3']);
  const descr       = (pick(r, ['distribution description']) ?? '').toString();

  const toNum = (v: any) => {
    if (v === null || v === undefined || v === '') return undefined;
    const s = v.toString().replace(/[^0-9\-\.,]/g, '').replace(/,/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  let vat: number | undefined;
  let net: number | undefined;

  // Detect "VAT ON 279.09" (or similar)
  const m = /vat\s*on\s*([0-9\.,\-]+)/i.exec(descr);
  if (m) {
    vat = toNum(rawAmount);  // Amount column is VAT
    net = toNum(m[1]);       // taxable base parsed from description
  } else {
    net = toNum(rawAmount);  // non-VAT rows: Amount is net
  }

  return {
    invoice : (rawInvoice ?? '').toString().trim(),
    supplier: (rawSupplier ?? '').toString().trim(),
    account : '',  // not present in this export
    net,
    vat,
    ff3     : (rawFF3 ?? '').toString().trim(),
    raw     : r,
  };
}
