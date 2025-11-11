import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(req: Request) {
  const { boxes, company, period, logoDataUrl } = await req.json();

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const { width } = page.getSize();
  const margin = 40;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontB = await pdf.embedFont(StandardFonts.HelveticaBold);

  if (logoDataUrl) {
    const bytes = Buffer.from(logoDataUrl.split(',')[1], 'base64');
    try {
      const png = await pdf.embedPng(bytes);
      page.drawImage(png, { x: margin, y: 780, width: 28, height: 28 });
    } catch {
      // ignore bad logo
    }
  }

  page.drawText('MediaFinance.Ai — VAT Checker', { x: margin + 36, y: 790, size: 13, font: fontB });
  if (company) page.drawText(company, { x: margin, y: 760, size: 11, font });
  if (period)  page.drawText(period,  { x: width - margin - font.widthOfTextAtSize(period, 11), y: 760, size: 11, font });

  const rows: [string,string,number][] = [
    ['Box 1','VAT due on sales', boxes[1] ?? 0],
    ['Box 2','VAT due on acquisitions (NI from EU)', boxes[2] ?? 0],
    ['Box 3','Total VAT due (1 + 2)', boxes[3] ?? 0],
    ['Box 4','VAT reclaimed on purchases', boxes[4] ?? 0],
    ['Box 5','Net VAT to pay or reclaim (3 − 4)', boxes[5] ?? 0],
    ['Box 6','Total value of sales (excl. VAT)', boxes[6] ?? 0],
    ['Box 7','Total value of purchases (excl. VAT)', boxes[7] ?? 0],
    ['Box 8','NI dispatches to EU (excl. VAT)', boxes[8] ?? 0],
    ['Box 9','NI acquisitions from EU (excl. VAT)', boxes[9] ?? 0],
  ];

  let y = 710;
  for (const [box, label, amt] of rows) {
    page.drawText(box, { x: margin, y, size: 11, font: fontB });
    page.drawText(label, { x: margin + 60, y, size: 11, font });
    const t = `£${Number(amt).toFixed(2)}`;
    const w = fontB.widthOfTextAtSize(t, 12);
    page.drawText(t, { x: width - margin - w, y, size: 12, font: fontB });
    y -= 28;
  }

  page.drawText('Prepared with MediaFinance.Ai', { x: margin, y: 40, size: 10, font, color: rgb(0.5,0.5,0.55) });

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="VAT_Return_${(period || 'Period').replace(/\s+/g,'_')}.pdf"`
    }
  });
}
