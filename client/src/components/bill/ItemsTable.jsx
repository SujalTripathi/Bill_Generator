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

const thStyle = {
  color: '#ffffff',
  fontSize: 9,
  fontWeight: 700,
  textAlign: 'center',
  padding: '5px 4px',
  borderBottom: '1px solid #ccc',
  whiteSpace: 'nowrap',
  backgroundColor: '#2563eb',
};

const tdStyle = {
  padding: '5px 4px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 10,
  verticalAlign: 'top',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ItemsTable({ items = [], isInterState = false }) {
  const hasCess = items.some((i) => Number(i.cessAmount) > 0);

  /* Aggregate footer totals */
  const totals = items.reduce(
    (acc, item) => {
      acc.qty += Number(item.quantity) || 0;
      acc.taxable += Number(item.taxableAmount) || 0;
      acc.cgst += Number(item.cgstAmount) || 0;
      acc.sgst += Number(item.sgstAmount) || 0;
      acc.igst += Number(item.igstAmount) || 0;
      acc.cess += Number(item.cessAmount) || 0;
      acc.total += Number(item.lineTotal) || 0;
      return acc;
    },
    { qty: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
  );

  /** Derive overall GST% for a single item */
  function gstPercent(item) {
    if (item.gstRate != null) return item.gstRate;
    if (isInterState) return item.igstRate ?? '';
    return ((Number(item.cgstRate) || 0) + (Number(item.sgstRate) || 0)) || '';
  }

  /* ---------------------------------------------------------------- */

  return (
    <div className="overflow-x-auto mt-1.5" style={{ overflowX: 'auto', marginTop: 6 }}>
      <table
        className="w-full"
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}
      >
        {/* ======================== THEAD ======================== */}
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 28 }}>#</th>
            <th style={{ ...thStyle, textAlign: 'left', minWidth: 120 }}>Description</th>
            <th style={{ ...thStyle, width: 70 }}>HSN/SAC</th>
            <th style={{ ...thStyle, width: 40 }}>Qty</th>
            <th style={{ ...thStyle, width: 40 }}>Unit</th>
            <th style={{ ...thStyle, width: 70 }}>Rate</th>
            <th style={{ ...thStyle, width: 45 }}>Disc%</th>
            <th style={{ ...thStyle, width: 80 }}>Taxable</th>
            <th style={{ ...thStyle, width: 45 }}>GST%</th>

            {isInterState ? (
              <>
                <th style={{ ...thStyle, width: 40 }}>IGST%</th>
                <th style={{ ...thStyle, width: 70 }}>IGST</th>
              </>
            ) : (
              <>
                <th style={{ ...thStyle, width: 40 }}>CGST%</th>
                <th style={{ ...thStyle, width: 65 }}>CGST</th>
                <th style={{ ...thStyle, width: 40 }}>SGST%</th>
                <th style={{ ...thStyle, width: 65 }}>SGST</th>
              </>
            )}

            {hasCess && <th style={{ ...thStyle, width: 60 }}>Cess</th>}

            <th style={{ ...thStyle, width: 85 }}>Total</th>
          </tr>
        </thead>

        {/* ======================== TBODY ======================== */}
        <tbody>
          {items.map((item, idx) => {
            const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';

            return (
              <tr key={item._id || idx} style={{ backgroundColor: rowBg }}>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.srNo ?? idx + 1}
                </td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>
                  {item.description}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.hsnOrSac}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.quantity}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.unit}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {fmt(item.ratePerUnit)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.discountPercent}%
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {fmt(item.taxableAmount)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {gstPercent(item)}%
                </td>

                {isInterState ? (
                  <>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {item.igstRate}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {fmt(item.igstAmount)}
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {item.cgstRate}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {fmt(item.cgstAmount)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {item.sgstRate}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {fmt(item.sgstAmount)}
                    </td>
                  </>
                )}

                {hasCess && (
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {fmt(item.cessAmount)}
                  </td>
                )}

                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                  {fmt(item.lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* ======================== TFOOT ======================== */}
        <tfoot>
          <tr
            style={{
              backgroundColor: '#f3f4f6',
              borderTop: '2px solid #d1d5db',
            }}
          >
            <td style={{ ...tdStyle, fontWeight: 700 }} />
            <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, fontSize: 11 }}>
              Total
            </td>
            <td style={tdStyle} />
            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
              {totals.qty}
            </td>
            <td style={tdStyle} />
            <td style={tdStyle} />
            <td style={tdStyle} />
            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
              {fmt(totals.taxable)}
            </td>
            {/* GST% footer — blank */}
            <td style={tdStyle} />

            {isInterState ? (
              <>
                <td style={tdStyle} />
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                  {fmt(totals.igst)}
                </td>
              </>
            ) : (
              <>
                <td style={tdStyle} />
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                  {fmt(totals.cgst)}
                </td>
                <td style={tdStyle} />
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                  {fmt(totals.sgst)}
                </td>
              </>
            )}

            {hasCess && (
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                {fmt(totals.cess)}
              </td>
            )}

            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, fontSize: 11 }}>
              {fmt(totals.total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
