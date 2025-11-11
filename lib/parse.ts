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

export async function parseAnyFile(file: File) {
  const name = file.name.toLowerCase();
  const text = await file.text();
  let rows: any[] = [];

  if (name.endsWith('.csv') || text.includes('\n') && text.includes(',')) {
    rows = parseCsv(text);
  } else if (name.endsWith('.xml') || text.trim().startsWith('<')) {
    rows = parseXml(text);
  } else {
    rows = parseCsv(text); // best-effort default
  }

  const normalized = rows.map((r, idx) => normalize(r, idx));
  return { file, rows: normalized };
}

function parseCsv(text: string): any[] {
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map(s => s.trim());
  return lines.map(line => {
    const parts = splitCsv(line);
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = parts[i]));
    return obj;
  });
}

// naive CSV split (handles quoted fields)
function splitCsv(line: string) {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i=0;i<line.length;i++){
    const c = line[i];
    if (c === '"' ) { q = !q; continue; }
    if (c === ',' && !q){ out.push(cur); cur=''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function parseXml(text: string): any[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const xml = parser.parse(text);

  // Heuristic: find the first array of objects that looks table-like
  const arrays = findArrays(xml);
  if (!arrays.length) return [];
  // choose the array with most objects containing Account/Invoice-like keys
  arrays.sort((a, b) => scoreArray(b) - scoreArray(a));
  return arrays[0];

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
  function scoreArray(arr: any[]): number {
    const keys = ['account','gl','invoice','doc','vat','tax','net','ff3','supplier','vendor'];
    let score = 0;
    for (const r of arr.slice(0,50)) {
      const ks = Object.keys(r).map(k => k.toLowerCase());
      if (ks.some(k => k.includes('account'))) score++;
      if (ks.some(k => k.includes('invoice') || k === 'doc' || k.includes('docno'))) score++;
    }
    return score;
  }
}

function normalize(r: any, idx: number): NormalizedRow {
  const lower = (k: string) => k.toLowerCase();
  const get = (keys: string[]) => {
    for (const k of Object.keys(r)) {
      const lk = lower(k);
      if (keys.includes(lk)) return r[k];
    }
    return undefined;
  };

  const invoice = (get(['invoice','inv','doc','document','docno','ref']) || '').toString().trim();
  const supplier = (get(['supplier','vendor','name','suppliername']) || '')?.toString().trim();
  const account = (get(['account','gl','code','nominal']) || '').toString().trim();

  const netRaw = get(['net','amount','base','goods','netamount','amountnet']);
  const vatRaw = get(['vat','tax','vatr','vatamount','taxamount']);

  const ff3 = (get(['ff3','flag','ff-3','freefield3']) || '')?.toString().trim();

  const toNum = (v: any) => {
    if (v === undefined || v === null || v === '') return undefined;
    const s = v.toString().replace(/[^0-9\-\.\,]/g, '').replace(/,/g,'');
    const n = Number(s);
    return isFinite(n) ? n : undefined;
  };

  return {
    invoice,
    supplier,
    account,
    net: toNum(netRaw),
    vat: toNum(vatRaw),
    ff3,
    raw: r
  };
}
