// lib/classify.ts
import type { Parsed } from './parse';

/**
 * Classify which parsed file is VAT ledger vs Cost ledger.
 * Since these SpreadsheetML exports don’t include 7501- accounts,
 * we use the presence of "VAT ON <amount>" in Distribution Description.
 */
export function classifyVatVsCost(files: Parsed[]) {
  if (!files || !files.length) return { vat: undefined, cost: undefined };

  const score = (p?: Parsed) => {
    if (!p) return -1;
    const rows = p.rows || [];
    if (!rows.length) return 0;
    const vatOnCount = rows.filter(r => {
      const d =
        (r.raw?.['Distribution Description'] ??
         r.raw?.['distribution description'] ??
         '').toString();
      return /vat\s*on\s*[0-9\.,\-]+/i.test(d);
    }).length;
    return vatOnCount / rows.length;
  };

  const s0 = score(files[0]);
  const s1 = score(files[1]);

  if (files.length === 1) return { vat: s0 >= 0.05 ? files[0] : undefined, cost: s0 < 0.05 ? files[0] : undefined };
  if (s0 >= s1) return { vat: files[0], cost: files[1] };
  return { vat: files[1], cost: files[0] };
}
