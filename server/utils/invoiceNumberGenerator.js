export function generateInvoiceNumber(prefix, lastNumber, date) {
  const d = new Date(date || Date.now());
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();

  // Indian Financial Year: April 1 to March 31
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = (fyStart + 1).toString().slice(-2);
  const fy = `${fyStart}-${fyEnd}`;

  const number = String(lastNumber + 1).padStart(3, '0');
  return {
    invoiceNumber: `${prefix}/${fy}/${number}`,
    financialYear: fy,
    sequenceNumber: lastNumber + 1,
  };
}

export function getCurrentFinancialYear(date) {
  const d = new Date(date || Date.now());
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = (fyStart + 1).toString().slice(-2);
  return `${fyStart}-${fyEnd}`;
}

export default generateInvoiceNumber;
