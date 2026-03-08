import React from 'react';

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function fmt(value) {
  const num = Number(value) || 0;
  return (
    '\u20B9' +
    num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/* ------------------------------------------------------------------ */
/*  Inline styles (print-safe)                                         */
/* ------------------------------------------------------------------ */

const labelStyle = {
  textAlign: 'left',
  padding: '3px 8px',
  fontWeight: 500,
  color: '#555',
  fontSize: 11,
};

const valueStyle = {
  textAlign: 'right',
  padding: '3px 8px',
  fontWeight: 500,
  color: '#222',
  fontSize: 11,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TaxSummary({ totals = {}, isInterState = false }) {
  const {
    subtotal = 0,
    totalDiscount = 0,
    totalTaxable = 0,
    totalCGST = 0,
    totalSGST = 0,
    totalIGST = 0,
    totalCess = 0,
    totalTax = 0,
    roundOff = 0,
    grandTotal = 0,
    accentColor = '#2563eb',
  } = totals;

  return (
    <div
      className="flex justify-end mt-2"
      style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}
    >
      <table
        className="text-xs"
        style={{ width: '40%', borderCollapse: 'collapse', fontSize: 11 }}
      >
        <tbody>
          {/* ---- Subtotal ---- */}
          <tr>
            <td style={labelStyle}>Subtotal</td>
            <td style={valueStyle}>{fmt(subtotal)}</td>
          </tr>

          {/* ---- Discount (conditional) ---- */}
          {totalDiscount > 0 && (
            <tr>
              <td style={labelStyle}>Total Discount</td>
              <td style={{ ...valueStyle, color: '#dc2626' }}>
                -{fmt(totalDiscount)}
              </td>
            </tr>
          )}

          {/* ---- Taxable Amount ---- */}
          <tr>
            <td style={labelStyle}>Taxable Amount</td>
            <td style={valueStyle}>{fmt(totalTaxable)}</td>
          </tr>

          {/* ---- Tax split ---- */}
          {!isInterState && (
            <>
              <tr>
                <td style={labelStyle}>CGST</td>
                <td style={valueStyle}>{fmt(totalCGST)}</td>
              </tr>
              <tr>
                <td style={labelStyle}>SGST</td>
                <td style={valueStyle}>{fmt(totalSGST)}</td>
              </tr>
            </>
          )}

          {isInterState && (
            <tr>
              <td style={labelStyle}>IGST</td>
              <td style={valueStyle}>{fmt(totalIGST)}</td>
            </tr>
          )}

          {/* ---- Cess (conditional) ---- */}
          {totalCess > 0 && (
            <tr>
              <td style={labelStyle}>Cess</td>
              <td style={valueStyle}>{fmt(totalCess)}</td>
            </tr>
          )}

          {/* ---- Total Tax ---- */}
          <tr>
            <td style={labelStyle}>Total Tax</td>
            <td style={valueStyle}>{fmt(totalTax)}</td>
          </tr>

          {/* ---- Round Off (conditional) ---- */}
          {roundOff !== 0 && (
            <tr>
              <td style={labelStyle}>Round Off</td>
              <td style={valueStyle}>
                {roundOff > 0 ? '+' : ''}
                {fmt(roundOff)}
              </td>
            </tr>
          )}

          {/* ---- Grand Total ---- */}
          <tr
            style={{ borderTop: `2px solid ${accentColor}` }}
          >
            <td
              style={{
                ...labelStyle,
                fontWeight: 700,
                fontSize: 13,
                color: accentColor,
              }}
            >
              Grand Total
            </td>
            <td
              style={{
                ...valueStyle,
                fontWeight: 700,
                fontSize: 13,
                color: accentColor,
              }}
            >
              {fmt(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
