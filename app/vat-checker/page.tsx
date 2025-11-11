'use client';

import { useMemo, useState } from 'react';
import { parseAnyFile, type Parsed, type NormalizedRow } from '../../lib/parse';
import { classifyVatVsCost } from '../../lib/classify';
import { reconcile, type RateMap, type ReconResult } from '../../lib/reconcile';
import { computeBoxes, type CostLine } from '../../lib/boxes';

export default function VATCheckerPage() {
  // Files + parsed
  const [costFile, setCostFile] = useState<File | null>(null);
  const [vatFile, setVatFile] = useState<File | null>(null);
  const [parsedCost, setParsedCost] = useState<Parsed | null>(null);
  const [parsedVat, setParsedVat] = useState<Parsed | null>(null);

  // Mapping + meta
  const [mapping, setMapping] = useState<RateMap>({
    std20: '', red5: '', red4: '', zero: '', exempt: '',
    os: '', rcGoods: '', rcServices: '', sales20: '', funding: ''
  });
  const [company, setCompany] = useState('');
  const [period, setPeriod] = useState('');

  // Results
  const [result, setResult] = useState<ReconResult | null>(null);
  const [boxes, setBoxes] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  // Diagnostics toggle
  const [showDiag, setShowDiag] = useState(false);

  const varianceIsZero = useMemo(() => {
    if (!result) return false;
    return Math.abs(result.variance) <= 0.01;
  }, [result]);

  // --- File chooser (drag select two files, auto-detect VAT vs Cost) ---
  const onFilesChosen = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 2);
    const parsed = await Promise.all(arr.map(f => parseAnyFile(f)));
    const tagged = classifyVatVsCost(parsed);
    setParsedVat(tagged.vat || null);
    setVatFile(tagged.vat?.file ?? null);
    setParsedCost(tagged.cost || null);
    setCostFile(tagged.cost?.file ?? null);
  };

  // --- Run reconciliation ---
  const runCheck = async () => {
    if (!parsedCost || !parsedVat) return;
    setLoading(true);
    try {
      const recon = reconcile(parsedCost, parsedVat, mapping);
      setResult(recon);

      // Convert NormalizedRow[] -> CostLine[] for boxes calculator (TS-safe)
      const costLines: CostLine[] = (recon.flatCostLines as NormalizedRow[])
        .filter(r => (r.invoice || '').trim() !== '')
        .map(r => ({
          invoice: (r.invoice || '').toString().trim(),
          net: r.net ?? 0,
          ff3: r.ff3 || ''
        }));

      const boxCalc = computeBoxes(costLines, recon.vatByInvoice, mapping);
      setBoxes(boxCalc.boxes);

      // Optional AI summary
      try {
        const resp = await fetch('/api/vat/summary', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            totals: {
              invoicesChecked: recon.countInvoices,
              matched: recon.countMatched,
              missingInCost: recon.missingInCost.length,
              missingInVat: recon.missingInVat.length,
              mismatched: recon.mismatched.length,
              variance: recon.variance,
              expected: recon.expectedTotal,
              claimed: recon.claimedTotal
            },
            sampleIssues: (recon.issues || []).slice(0, 3),
            company, period
          })
        });
        const data = await resp.json();
        setSummary(data.summary || '');
      } catch {
        setSummary(
          `Checked ${recon.countInvoices} invoices. ` +
          `${recon.countMatched} matched, ${recon.missingInCost.length} in VAT only, ` +
          `${recon.missingInVat.length} in cost only, ${recon.mismatched.length} mismatched. ` +
          `Variance £${recon.variance.toFixed(2)}.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PDF generation ---
  const generatePdf = async () => {
    if (!boxes) return;

    // inline logo as data URL
    const logoDataUrl = await fetch('/logo-icon.png')
      .then(r => r.blob())
      .then(b => new Promise<string>(res => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.readAsDataURL(b);
      }));

    const resp = await fetch('/api/vat/pdf', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ boxes, company, period, logoDataUrl })
    });
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `VAT_Return_${(period || 'Period').replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helpers for diagnostics preview (first non-empty rows)
  const previewRows = (rows?: NormalizedRow[]) =>
    (rows || [])
      .filter(r => r.invoice || r.net !== undefined || r.vat !== undefined)
      .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center pt-8">
        <img src="/logo-icon.png" alt="MediaFinance.Ai Logo" className="mx-auto mb-2" style={{ width: 64, height: 64 }} />
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">VAT Checker</h1>
        <p className="text-gray-300 text-sm max-w-xl mx-auto mt-2">
          Upload your two PSL exports, map your FF3 flags, and reconcile VAT claimed vs expected by invoice.
        </p>
      </section>

      {/* Uploads + Mapping */}
      <section className="card p-6 max-w-5xl mx-auto">
        <h2 className="text-lg font-medium mb-4">1) Upload files</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-white/15 bg-white/5">
            <div className="text-sm mb-2">
              Drop two files (CSV or XML) — the system auto-detects VAT vs Cost. You can override after.
            </div>
            <input
              type="file"
              multiple
              accept=".csv,.xml,.txt,.psv"
              onChange={(e) => onFilesChosen(e.target.files)}
            />
            <div className="text-xs text-gray-300 mt-2">
              Detected VAT ledger: <b>{vatFile?.name || '-'}</b><br />
              Detected Cost ledger: <b>{costFile?.name || '-'}</b>
            </div>

            <button
              className="mt-3 small underline"
              onClick={() => setShowDiag(v => !v)}
            >
              {showDiag ? 'Hide diagnostics' : 'Show diagnostics'}
            </button>

            {showDiag && (
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-2 rounded bg-black/30 border border-white/10 overflow-auto">
                  <div className="font-semibold mb-1">VAT ledger diagnostics</div>
                  <div>File: {vatFile?.name || '-'}</div>
                  <div>Kind: {parsedVat?.meta.kind ?? '-'}</div>
                  <div>Rows: {parsedVat?.meta.count ?? 0} · Invoice IDs: {Math.round((parsedVat?.meta.invoicePresentRate ?? 0) * 100)}% · 7501 ratio: {Math.round((parsedVat?.meta.vatAccountRatio ?? 0) * 100)}%</div>
                  <div className="mt-1">Detected headers:</div>
                  <pre className="whitespace-pre-wrap">{(parsedVat?.meta.headers || []).join(', ') || '—'}</pre>
                  <div className="mt-1">First raw row:</div>
                  <pre>{parsedVat?.meta.sampleRaw ? JSON.stringify(parsedVat.meta.sampleRaw, null, 2) : '—'}</pre>
                  <div className="mt-1">First 3 non-empty normalized rows:</div>
                  <pre>{parsedVat?.rows?.length ? JSON.stringify(previewRows(parsedVat.rows), null, 2) : '—'}</pre>
                </div>

                <div className="p-2 rounded bg-black/30 border border-white/10 overflow-auto">
                  <div className="font-semibold mb-1">Cost ledger diagnostics</div>
                  <div>File: {costFile?.name || '-'}</div>
                  <div>Kind: {parsedCost?.meta.kind ?? '-'}</div>
                  <div>Rows: {parsedCost?.meta.count ?? 0} · Invoice IDs: {Math.round((parsedCost?.meta.invoicePresentRate ?? 0) * 100)}% · 7501 ratio: {Math.round((parsedCost?.meta.vatAccountRatio ?? 0) * 100)}%</div>
                  <div className="mt-1">Detected headers:</div>
                  <pre className="whitespace-pre-wrap">{(parsedCost?.meta.headers || []).join(', ') || '—'}</pre>
                  <div className="mt-1">First raw row:</div>
                  <pre>{parsedCost?.meta.sampleRaw ? JSON.stringify(parsedCost.meta.sampleRaw, null, 2) : '—'}</pre>
                  <div className="mt-1">First 3 non-empty normalized rows:</div>
                  <pre>{parsedCost?.rows?.length ? JSON.stringify(previewRows(parsedCost.rows), null, 2) : '—'}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded border border-white/15 bg-white/5">
            <div className="text-sm mb-2">Company & Period (for your PDF)</div>
            <input
              className="w-full mb-2 px-3 py-2 rounded bg-white/10 border border-white/15"
              placeholder="Company (optional)"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/15"
              placeholder="Period e.g. Sep 2025 (optional)"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            />
          </div>
        </div>

        <h2 className="text-lg font-medium mt-6 mb-2">2) Map FF3 flags</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {([
            ['std20', '20% Standard UK VAT'],
            ['red5', '5% Reduced VAT'],
            ['red4', '4% Reduced VAT'],
            ['zero', '0% VAT'],
            ['exempt', 'Exempt'],
            ['os', 'Outside Scope'],
            ['rcGoods', 'Reverse Charge – Goods'],
            ['rcServices', 'Reverse Charge – Services'],
            ['sales20', 'Sales VAT 20%'],
            ['funding', 'Funding (out of scope)'],
          ] as const).map(([k, label]) => (
            <div key={k} className="flex items-center gap-2">
              <label className="w-48 text-gray-300">{label}</label>
              <input
                className="flex-1 px-2 py-1 rounded bg-white/10 border border-white/15"
                value={(mapping as any)[k] || ''}
                onChange={e => setMapping(m => ({ ...m, [k]: e.target.value }))}
                placeholder="e.g. 20"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="button" onClick={runCheck} disabled={!parsedCost || !parsedVat || loading}>
            {loading ? 'Running…' : 'Run Check'}
          </button>
          {result && (
            <div className="text-sm small">
              Expected: £{result.expectedTotal.toFixed(2)} · Claimed: £{result.claimedTotal.toFixed(2)} · Variance: <b>£{result.variance.toFixed(2)}</b>
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      {result && (
        <section className="card p-6 max-w-5xl mx-auto">
          <h2 className="text-lg font-medium mb-2">Summary</h2>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="p-4 rounded bg-white/5 border border-white/10">
              <div className="small">VAT claimed (VAT ledger)</div>
              <div className="text-xl font-semibold">£{result.claimedTotal.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded bg-white/5 border border-white/10">
              <div className="small">Expected VAT (from cost flags)</div>
              <div className="text-xl font-semibold">£{result.expectedTotal.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded bg-white/5 border border-white/10">
              <div className="small">Variance</div>
              <div className={`text-xl font-semibold ${Math.abs(result.variance) <= 0.01 ? 'text-green-400' : 'text-red-300'}`}>
                £{result.variance.toFixed(2)}
              </div>
            </div>
          </div>

          {summary && <p className="mt-4 text-sm text-gray-300">{summary}</p>}

          <div className="mt-4">
            <h3 className="font-medium mb-2">Boxes 1–9</h3>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              {boxes && [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <div key={n} className="p-3 rounded bg-white/5 border border-white/10 flex items-center justify-between">
                  <span>Box {n}</span><b>£{boxes[n].toFixed(2)}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button className="button" onClick={generatePdf} disabled={!varianceIsZero}>
              Generate VAT PDF
            </button>
            {!varianceIsZero && <span className="text-sm ml-3 small">PDF enabled when variance is £0.00</span>}
          </div>
        </section>
      )}

      {/* Issues */}
      {result && (
        <section className="card p-6 max-w-5xl mx-auto">
          <h2 className="text-lg font-medium mb-3">Issues</h2>
          {result.issues.length === 0 ? (
            <div className="text-sm text-gray-300">No issues found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-300">
                  <tr>
                    <th className="py-2 pr-4">Invoice</th>
                    <th className="py-2 pr-4">Supplier</th>
                    <th className="py-2 pr-4">Cost Total</th>
                    <th className="py-2 pr-4">Expected VAT</th>
                    <th className="py-2 pr-4">VAT Claimed</th>
                    <th className="py-2 pr-4">FF3 Flags</th>
                    <th className="py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issues.map((it, idx) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2 pr-4">{it.invoice}</td>
                      <td className="py-2 pr-4">{it.supplier || '-'}</td>
                      <td className="py-2 pr-4">£{(it.costTotal ?? 0).toFixed(2)}</td>
                      <td className="py-2 pr-4">£{(it.expectedVat ?? 0).toFixed(2)}</td>
                      <td className="py-2 pr-4">£{(it.claimedVat ?? 0).toFixed(2)}</td>
                      <td className="py-2 pr-4">{Array.isArray(it.flags) ? it.flags.join(', ') : (it.flags || '-')}</td>
                      <td className="py-2">{it.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
