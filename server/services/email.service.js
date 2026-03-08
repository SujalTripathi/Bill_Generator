import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export async function sendInvoiceEmail({ to, subject, html, pdfBuffer, invoiceNumber }) {
  const transporter = createTransporter();

  const attachments = [];
  if (pdfBuffer) {
    attachments.push({
      filename: `${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  const info = await transporter.sendMail({
    from: `"SmartBill" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || `Invoice ${invoiceNumber}`,
    html,
    attachments,
  });

  return info;
}
