import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { totals, sampleIssues = [], company, period } = body || {};
  const key = process.env.OPENAI_API_KEY;

  const fallback =
    `Summary for ${company || 'your company'} ${period ? `(${period})` : ''}. ` +
    `${totals?.invoicesChecked || 0} invoices checked. ` +
    `${totals?.matched || 0} matched, ${totals?.missingInCost || 0} claimed without cost, ` +
    `${totals?.missingInVat || 0} with cost but no claim, ${totals?.mismatched || 0} mismatched. ` +
    `Variance £${Number(totals?.variance || 0).toFixed(2)}.`;

  if (!key) return NextResponse.json({ summary: fallback });

  try {
    const prompt = [
      `Write a concise, professional 2–3 sentence summary for a VAT reconciliation.`,
      `Company: ${company || 'N/A'}, Period: ${period || 'N/A'}.`,
      `Totals: ${JSON.stringify(totals)}`,
      `Top issues: ${JSON.stringify(sampleIssues)}`,
      `Tone: clear, non-fluffy, useful for a production accountant.`,
    ].join('\n');

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        max_output_tokens: 150
      })
    });
    const j = await resp.json();
    const text = j?.output_text || j?.choices?.[0]?.message?.content || fallback;
    return NextResponse.json({ summary: text.toString().trim() });
  } catch {
    return NextResponse.json({ summary: fallback });
  }
}
