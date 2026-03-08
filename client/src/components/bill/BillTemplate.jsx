import React from 'react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatCurrency(value) {
  const num = Number(value) || 0;
  return '\u20B9' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Custom‑field renderer                                             */
/* ------------------------------------------------------------------ */

function CustomFieldValue({ field }) {
  const { fieldType, value, label } = field;

  switch (fieldType) {
    case 'date':
      return (
        <div style={styles.cfBlock}>
          <span style={styles.cfLabel}>{label}:</span>
          <span style={styles.cfValue}>{formatDate(value)}</span>
        </div>
      );

    case 'checkbox':
      return (
        <div style={styles.cfBlock}>
          <span style={styles.cfLabel}>{label}:</span>
          <span style={styles.cfValue}>
            {value ? '\u2611' : '\u2610'}
          </span>
        </div>
      );

    case 'signature':
      return (
        <div style={{ ...styles.cfBlock, flexDirection: 'column', alignItems: 'flex-start' }}>
          <div
            style={{
              width: field.width || '100%',
              height: 60,
              border: '1px solid #999',
              borderRadius: 2,
              backgroundColor: '#fafafa',
            }}
          />
          <span style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{label}</span>
        </div>
      );

    case 'stampbox':
      return (
        <div style={{ ...styles.cfBlock, flexDirection: 'column', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 80,
              height: 80,
              border: '2px dotted #999',
              borderRadius: 4,
              backgroundColor: '#fafafa',
            }}
          />
          <span style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{label}</span>
        </div>
      );

    case 'image':
      return (
        <div style={{ ...styles.cfBlock, flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={styles.cfLabel}>{label}:</span>
          {value ? (
            <img
              src={value}
              alt={label}
              style={{ maxWidth: field.width || 160, maxHeight: 100, objectFit: 'contain', marginTop: 2 }}
            />
          ) : (
            <span style={styles.cfValue}>-</span>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div style={styles.cfBlock}>
          <span style={styles.cfLabel}>{label}:</span>
          <span style={{ ...styles.cfValue, whiteSpace: 'pre-wrap' }}>{value || '-'}</span>
        </div>
      );

    case 'text':
    case 'number':
    default:
      return (
        <div style={styles.cfBlock}>
          <span style={styles.cfLabel}>{label}:</span>
          <span style={styles.cfValue}>{value !== undefined && value !== null && value !== '' ? String(value) : '-'}</span>
        </div>
      );
  }
}

function CustomFieldsRow({ fields }) {
  if (!fields || fields.length === 0) return null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 24px',
        padding: '6px 0',
      }}
    >
      {fields.map((f) => (
        <div key={f.id} style={{ width: f.width || '100%' }}>
          <CustomFieldValue field={f} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function BillTemplate({ invoice, businessProfile }) {
  if (!invoice) return null;

  const {
    seller = {},
    buyer = {},
    shippingAddress = {},
    items = [],
    billType = 'TAX INVOICE',
    invoiceNumber = '',
    invoiceDate,
    dueDate,
    placeOfSupply = '',
    isInterState = false,
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
    amountInWords = '',
    customFields = [],
    notes = '',
    termsAndConditions = '',
    status = '',
  } = invoice;

  const bp = businessProfile || {};
  const accent = bp.primaryColor || '#2563eb';

  /* Partition custom fields by position */
  const cfHeader = customFields.filter((f) => f.position === 'header');
  const cfBelowBuyer = customFields.filter((f) => f.position === 'below_buyer');
  const cfAboveItems = customFields.filter((f) => f.position === 'above_items');
  const cfBelowItems = customFields.filter((f) => f.position === 'below_items');
  const cfFooter = customFields.filter((f) => f.position === 'footer');

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div id="bill-print-area" style={styles.page}>
      {/* ============ DRAFT WATERMARK ============ */}
      {status === 'draft' && (
        <div style={styles.watermark}>DRAFT</div>
      )}

      {/* ============ 1. TOP HEADER ============ */}
      <div style={{ ...styles.headerRow, borderBottom: `2px solid ${accent}` }}>
        {/* Left — Logo + Business info */}
        <div style={styles.headerLeft}>
          {seller.logoUrl && (
            <img
              src={seller.logoUrl}
              alt="Logo"
              style={styles.logo}
            />
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>
              {seller.businessName}
            </div>
            {seller.gstin && (
              <div style={{ fontSize: 10, color: '#444' }}>
                GSTIN: {seller.gstin}
              </div>
            )}
            {seller.address && (
              <div style={{ fontSize: 10, color: '#555' }}>{seller.address}</div>
            )}
            {(seller.city || seller.state) && (
              <div style={{ fontSize: 10, color: '#555' }}>
                {[seller.city, seller.state].filter(Boolean).join(', ')}
                {seller.stateCode ? ` (${seller.stateCode})` : ''}
              </div>
            )}
            {seller.phone && (
              <div style={{ fontSize: 10, color: '#555' }}>Ph: {seller.phone}</div>
            )}
            {seller.email && (
              <div style={{ fontSize: 10, color: '#555' }}>{seller.email}</div>
            )}
          </div>
        </div>

        {/* Centre — Bill type */}
        <div style={styles.headerCenter}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1.5, color: accent }}>
            {billType}
          </div>
        </div>

        {/* Right — Invoice # and dates */}
        <div style={styles.headerRight}>
          <div style={{ fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600 }}>Invoice #: </span>{invoiceNumber}
          </div>
          <div style={{ fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600 }}>Date: </span>{formatDate(invoiceDate)}
          </div>
          {dueDate && (
            <div style={{ fontSize: 11 }}>
              <span style={{ fontWeight: 600 }}>Due: </span>{formatDate(dueDate)}
            </div>
          )}
        </div>
      </div>

      {/* ============ 2. Custom fields — header ============ */}
      {cfHeader.length > 0 && (
        <div style={styles.section}>
          <CustomFieldsRow fields={cfHeader} />
        </div>
      )}

      {/* ============ 3. BUYER / SHIP‑TO + Place of Supply ============ */}
      <div style={styles.addressRow}>
        {/* Bill To */}
        <div style={styles.addressBox}>
          <div style={{ ...styles.addressTitle, backgroundColor: accent }}>Bill To</div>
          <div style={styles.addressBody}>
            {buyer.name && <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{buyer.name}</div>}
            {buyer.gstin && <div style={{ fontSize: 10, color: '#444' }}>GSTIN: {buyer.gstin}</div>}
            {buyer.addressLine1 && <div style={{ fontSize: 10 }}>{buyer.addressLine1}</div>}
            {(buyer.city || buyer.state) && (
              <div style={{ fontSize: 10 }}>
                {[buyer.city, buyer.state].filter(Boolean).join(', ')}
                {buyer.stateCode ? ` (${buyer.stateCode})` : ''}
              </div>
            )}
            {buyer.phone && <div style={{ fontSize: 10 }}>Ph: {buyer.phone}</div>}
            {buyer.email && <div style={{ fontSize: 10 }}>{buyer.email}</div>}
          </div>
        </div>

        {/* Ship To — only show if shipping address has actual data */}
        {(shippingAddress.name || shippingAddress.addressLine1 || shippingAddress.city || shippingAddress.state) && (
        <div style={styles.addressBox}>
          <div style={{ ...styles.addressTitle, backgroundColor: accent }}>Ship To</div>
          <div style={styles.addressBody}>
            {shippingAddress.name && <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{shippingAddress.name}</div>}
            {shippingAddress.addressLine1 && <div style={{ fontSize: 10 }}>{shippingAddress.addressLine1}</div>}
            {(shippingAddress.city || shippingAddress.state) && (
              <div style={{ fontSize: 10 }}>
                {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ')}
              </div>
            )}
            {shippingAddress.pincode && <div style={{ fontSize: 10 }}>PIN: {shippingAddress.pincode}</div>}
          </div>
        </div>
        )}
      </div>

      {placeOfSupply && (
        <div style={{ fontSize: 10, padding: '4px 0', color: '#333' }}>
          <span style={{ fontWeight: 600 }}>Place of Supply: </span>{placeOfSupply}
          {isInterState ? ' (Inter-State)' : ' (Intra-State)'}
        </div>
      )}

      {/* ============ 4. Custom fields — below_buyer ============ */}
      {cfBelowBuyer.length > 0 && (
        <div style={styles.section}>
          <CustomFieldsRow fields={cfBelowBuyer} />
        </div>
      )}

      {/* ============ 5. Custom fields — above_items ============ */}
      {cfAboveItems.length > 0 && (
        <div style={styles.section}>
          <CustomFieldsRow fields={cfAboveItems} />
        </div>
      )}

      {/* ============ 6. ITEMS TABLE ============ */}
      <div style={{ overflowX: 'auto', marginTop: 6 }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 28, backgroundColor: accent }}>#</th>
              <th style={{ ...styles.th, textAlign: 'left', minWidth: 120, backgroundColor: accent }}>Description</th>
              <th style={{ ...styles.th, width: 70, backgroundColor: accent }}>HSN/SAC</th>
              <th style={{ ...styles.th, width: 40, backgroundColor: accent }}>Qty</th>
              <th style={{ ...styles.th, width: 40, backgroundColor: accent }}>Unit</th>
              <th style={{ ...styles.th, width: 70, backgroundColor: accent }}>Rate</th>
              <th style={{ ...styles.th, width: 45, backgroundColor: accent }}>Disc%</th>
              <th style={{ ...styles.th, width: 80, backgroundColor: accent }}>Taxable</th>
              {isInterState ? (
                <>
                  <th style={{ ...styles.th, width: 40, backgroundColor: accent }}>IGST%</th>
                  <th style={{ ...styles.th, width: 70, backgroundColor: accent }}>IGST</th>
                </>
              ) : (
                <>
                  <th style={{ ...styles.th, width: 40, backgroundColor: accent }}>CGST%</th>
                  <th style={{ ...styles.th, width: 65, backgroundColor: accent }}>CGST</th>
                  <th style={{ ...styles.th, width: 40, backgroundColor: accent }}>SGST%</th>
                  <th style={{ ...styles.th, width: 65, backgroundColor: accent }}>SGST</th>
                </>
              )}
              {items.some((i) => i.cessAmount > 0) && (
                <th style={{ ...styles.th, width: 60, backgroundColor: accent }}>Cess</th>
              )}
              <th style={{ ...styles.th, width: 85, backgroundColor: accent }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
              return (
                <tr key={idx} style={{ backgroundColor: rowBg }}>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.srNo ?? idx + 1}</td>
                  <td style={{ ...styles.td, textAlign: 'left' }}>{item.description}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.hsnOrSac}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.ratePerUnit)}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.discountPercent}%</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.taxableAmount)}</td>
                  {isInterState ? (
                    <>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{item.igstRate}%</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.igstAmount)}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{item.cgstRate}%</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.cgstAmount)}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{item.sgstRate}%</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.sgstAmount)}</td>
                    </>
                  )}
                  {items.some((i) => i.cessAmount > 0) && (
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.cessAmount)}</td>
                  )}
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============ 7. Custom fields — below_items ============ */}
      {cfBelowItems.length > 0 && (
        <div style={styles.section}>
          <CustomFieldsRow fields={cfBelowItems} />
        </div>
      )}

      {/* ============ 8. TOTALS BOX (right-aligned, ~40% width) ============ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <table style={{ width: '40%', borderCollapse: 'collapse', fontSize: 11 }}>
          <tbody>
            <tr>
              <td style={styles.totalLabel}>Subtotal</td>
              <td style={styles.totalValue}>{formatCurrency(subtotal)}</td>
            </tr>
            {totalDiscount > 0 && (
              <tr>
                <td style={styles.totalLabel}>Discount</td>
                <td style={{ ...styles.totalValue, color: '#dc2626' }}>-{formatCurrency(totalDiscount)}</td>
              </tr>
            )}
            <tr>
              <td style={styles.totalLabel}>Taxable Amount</td>
              <td style={styles.totalValue}>{formatCurrency(totalTaxable)}</td>
            </tr>
            {!isInterState && (
              <>
                <tr>
                  <td style={styles.totalLabel}>CGST</td>
                  <td style={styles.totalValue}>{formatCurrency(totalCGST)}</td>
                </tr>
                <tr>
                  <td style={styles.totalLabel}>SGST</td>
                  <td style={styles.totalValue}>{formatCurrency(totalSGST)}</td>
                </tr>
              </>
            )}
            {isInterState && (
              <tr>
                <td style={styles.totalLabel}>IGST</td>
                <td style={styles.totalValue}>{formatCurrency(totalIGST)}</td>
              </tr>
            )}
            {totalCess > 0 && (
              <tr>
                <td style={styles.totalLabel}>Cess</td>
                <td style={styles.totalValue}>{formatCurrency(totalCess)}</td>
              </tr>
            )}
            <tr>
              <td style={styles.totalLabel}>Total Tax</td>
              <td style={styles.totalValue}>{formatCurrency(totalTax)}</td>
            </tr>
            {roundOff !== 0 && (
              <tr>
                <td style={styles.totalLabel}>Round Off</td>
                <td style={styles.totalValue}>{roundOff > 0 ? '+' : ''}{formatCurrency(roundOff)}</td>
              </tr>
            )}
            <tr style={{ borderTop: `2px solid ${accent}` }}>
              <td style={{ ...styles.totalLabel, fontWeight: 700, fontSize: 13, color: accent }}>Grand Total</td>
              <td style={{ ...styles.totalValue, fontWeight: 700, fontSize: 13, color: accent }}>{formatCurrency(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ============ 9. AMOUNT IN WORDS ============ */}
      {amountInWords && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 3,
            fontSize: 11,
            fontStyle: 'italic',
            color: '#333',
          }}
        >
          <span style={{ fontWeight: 600, fontStyle: 'normal' }}>Amount in Words: </span>
          {amountInWords}
        </div>
      )}

      {/* ============ 10. BANK DETAILS + UPI ============ */}
      {(bp.bankName || bp.accountNumber || bp.ifscCode || bp.upiId) && (
        <div style={{ marginTop: 10, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 3, fontSize: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: accent }}>Bank Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px' }}>
            {bp.bankName && (
              <div><span style={{ fontWeight: 600 }}>Bank: </span>{bp.bankName}</div>
            )}
            {bp.accountNumber && (
              <div><span style={{ fontWeight: 600 }}>A/C No: </span>{bp.accountNumber}</div>
            )}
            {bp.ifscCode && (
              <div><span style={{ fontWeight: 600 }}>IFSC: </span>{bp.ifscCode}</div>
            )}
            {bp.accountHolderName && (
              <div><span style={{ fontWeight: 600 }}>Name: </span>{bp.accountHolderName}</div>
            )}
            {bp.upiId && (
              <div><span style={{ fontWeight: 600 }}>UPI ID: </span>{bp.upiId}</div>
            )}
          </div>
        </div>
      )}

      {/* ============ 11. NOTES & TERMS ============ */}
      {(notes || termsAndConditions) && (
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {notes && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2, color: accent }}>Notes</div>
              <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{notes}</div>
            </div>
          )}
          {termsAndConditions && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2, color: accent }}>Terms & Conditions</div>
              <div style={{ fontSize: 10, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{termsAndConditions}</div>
            </div>
          )}
        </div>
      )}

      {/* ============ 12. Custom fields — footer ============ */}
      {cfFooter.length > 0 && (
        <div style={{ ...styles.section, marginTop: 8 }}>
          <CustomFieldsRow fields={cfFooter} />
        </div>
      )}

      {/* ============ 13. SIGNATURE ROW ============ */}
      <div style={styles.signatureRow}>
        <div style={{ fontSize: 10, color: '#888' }}>
          Computer generated invoice
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: 30 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>
            For {seller.businessName || 'Business'}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles — all inline for print compatibility                       */
/* ------------------------------------------------------------------ */

const styles = {
  /* ---- Page ---- */
  page: {
    position: 'relative',
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: '#222',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },

  /* ---- Watermark ---- */
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-35deg)',
    fontSize: 100,
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.06)',
    letterSpacing: 20,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 0,
  },

  /* ---- Header ---- */
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '40%',
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    borderRadius: 4,
  },
  headerCenter: {
    textAlign: 'center',
    flex: '0 0 auto',
  },
  headerRight: {
    textAlign: 'right',
    maxWidth: '30%',
  },

  /* ---- Address ---- */
  addressRow: {
    display: 'flex',
    gap: 16,
    marginTop: 6,
  },
  addressBox: {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    overflow: 'hidden',
  },
  addressTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 8px',
  },
  addressBody: {
    padding: '6px 8px',
    lineHeight: 1.6,
  },

  /* ---- Table ---- */
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 10,
  },
  th: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
    padding: '5px 4px',
    borderBottom: '1px solid #ccc',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '5px 4px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: 10,
    textAlign: 'right',
    verticalAlign: 'top',
  },

  /* ---- Totals ---- */
  totalLabel: {
    textAlign: 'left',
    padding: '3px 8px',
    fontWeight: 500,
    color: '#555',
  },
  totalValue: {
    textAlign: 'right',
    padding: '3px 8px',
    fontWeight: 500,
    color: '#222',
  },

  /* ---- Signature ---- */
  signatureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 24,
    paddingTop: 10,
    borderTop: '1px solid #d1d5db',
  },

  /* ---- Sections ---- */
  section: {
    padding: '4px 0',
  },

  /* ---- Custom-field atoms ---- */
  cfBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    padding: '2px 0',
  },
  cfLabel: {
    fontWeight: 600,
    color: '#444',
  },
  cfValue: {
    color: '#222',
  },
};
