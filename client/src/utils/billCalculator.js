import { numberToWords } from './numberToWords';

export function calculateLineItem(item, isInterState) {
  const quantity = Number(item.quantity) || 0;
  const ratePerUnit = Number(item.ratePerUnit) || 0;
  const discountPercent = Number(item.discountPercent) || 0;
  const gstRate = Number(item.gstRate) || 0;
  const cessRate = Number(item.cessRate) || 0;

  const grossAmount = quantity * ratePerUnit;
  const discountAmount = grossAmount * (discountPercent / 100);
  const taxableAmount = grossAmount - discountAmount;

  let cgstRate = 0, cgstAmount = 0, sgstRate = 0, sgstAmount = 0, igstRate = 0, igstAmount = 0;

  if (!isInterState) {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = parseFloat((taxableAmount * cgstRate / 100).toFixed(2));
    sgstAmount = parseFloat((taxableAmount * sgstRate / 100).toFixed(2));
  } else {
    igstRate = gstRate;
    igstAmount = parseFloat((taxableAmount * igstRate / 100).toFixed(2));
  }

  const cessAmount = parseFloat((taxableAmount * cessRate / 100).toFixed(2));
  const lineTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount + cessAmount;

  return {
    ...item,
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    cgstRate, cgstAmount, sgstRate, sgstAmount, igstRate, igstAmount,
    cessRate, cessAmount,
    lineTotal: parseFloat(lineTotal.toFixed(2)),
  };
}

export function calculateBillTotals(items, sellerState, buyerState) {
  const isInterState = (sellerState || '').trim().toLowerCase() !== (buyerState || '').trim().toLowerCase();

  const calculatedItems = items.map((item, index) => ({
    ...calculateLineItem(item, isInterState),
    srNo: index + 1,
  }));

  const subtotal = calculatedItems.reduce((s, i) => s + i.grossAmount, 0);
  const totalDiscount = calculatedItems.reduce((s, i) => s + i.discountAmount, 0);
  const totalTaxable = calculatedItems.reduce((s, i) => s + i.taxableAmount, 0);
  const totalCGST = calculatedItems.reduce((s, i) => s + i.cgstAmount, 0);
  const totalSGST = calculatedItems.reduce((s, i) => s + i.sgstAmount, 0);
  const totalIGST = calculatedItems.reduce((s, i) => s + i.igstAmount, 0);
  const totalCess = calculatedItems.reduce((s, i) => s + i.cessAmount, 0);
  const totalTax = totalCGST + totalSGST + totalIGST + totalCess;
  const rawTotal = totalTaxable + totalTax;
  const roundOff = parseFloat((Math.round(rawTotal) - rawTotal).toFixed(2));
  const grandTotal = Math.round(rawTotal);

  return {
    isInterState, items: calculatedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalTaxable: parseFloat(totalTaxable.toFixed(2)),
    totalCGST: parseFloat(totalCGST.toFixed(2)),
    totalSGST: parseFloat(totalSGST.toFixed(2)),
    totalIGST: parseFloat(totalIGST.toFixed(2)),
    totalCess: parseFloat(totalCess.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    roundOff, grandTotal,
    amountInWords: numberToWords(grandTotal),
  };
}
