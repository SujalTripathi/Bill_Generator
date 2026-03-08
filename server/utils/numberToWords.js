const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertChunk(num) {
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertChunk(num % 100) : '');
}

export function numberToWords(amount) {
  if (amount === 0) return 'Rupees Zero Only';

  const num = Math.abs(amount);
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Rupees Zero Only';

  let words = '';

  // Indian number system: Crores, Lakhs, Thousands, Hundreds
  const crores = Math.floor(rupees / 10000000);
  const lakhs = Math.floor((rupees % 10000000) / 100000);
  const thousands = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  if (crores > 0) words += convertChunk(crores) + ' Crore ';
  if (lakhs > 0) words += convertChunk(lakhs) + ' Lakh ';
  if (thousands > 0) words += convertChunk(thousands) + ' Thousand ';
  if (remainder > 0) words += convertChunk(remainder);

  let result = '';
  if (rupees > 0) {
    result = 'Rupees ' + words.trim();
  }

  if (paise > 0) {
    if (rupees > 0) result += ' and ';
    result += convertChunk(paise) + ' Paise';
  } else if (rupees === 0) {
    return 'Rupees Zero Only';
  }

  return (result || 'Rupees Zero') + ' Only';
}

export default numberToWords;
