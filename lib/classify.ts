import type { NormalizedRow } from './parse';

export function classifyVatVsCost(parsedArr: { file: File, rows: NormalizedRow[] }[]) {
  let vat: any = null, cost: any = null;

  const startsWith7501 = (r: NormalizedRow) => (r.account || '').toString().startsWith('7501-');
  parsedArr.forEach(p => {
    const rows = p.rows || [];
    const pct = rows.length ? rows.filter(startsWith7501).length / rows.length : 0;
    if (pct > 0.6) vat = p; else cost = p;
  });

  // fallback if ambiguous: pick the one with higher 7501 ratio as VAT
  if (!vat || !cost) {
    parsedArr.sort((a,b) => ratio(b) - ratio(a));
    vat = parsedArr[0]; cost = parsedArr[1];
  }
  return { vat, cost };

  function ratio(p: any) {
    const rows = p?.rows || [];
    return rows.length ? rows.filter(startsWith7501).length / rows.length : 0;
    }
}
