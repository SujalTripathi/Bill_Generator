import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadBillAsPDF(elementId, invoiceNumber) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Bill element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // Handle multi-page if content is taller than A4
  const pageHeight = pdf.internal.pageSize.getHeight();
  if (pdfHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  } else {
    let heightLeft = pdfHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(`${invoiceNumber || 'invoice'}.pdf`);
}

export function generateWhatsAppURL(invoice, businessName) {
  const message = `*Invoice from ${businessName}*
Invoice No: ${invoice.invoiceNumber}
Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
Amount: ₹${invoice.grandTotal?.toLocaleString('en-IN')}
Status: ${(invoice.status || 'draft').toUpperCase()}

View & Download: ${window.location.origin}/bill/${invoice.publicToken}

_Powered by SmartBill_`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
