// Server-side PDF generation placeholder
// Primary PDF generation is done client-side via html2canvas + jsPDF
// This service can be used for email attachments if needed

export async function generatePDFBuffer(htmlContent) {
  // For server-side PDF, we return null and rely on client-side generation
  // If puppeteer is available and configured, it can be used here
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    await browser.close();
    return pdfBuffer;
  } catch {
    console.warn('Puppeteer not available for server-side PDF generation');
    return null;
  }
}
