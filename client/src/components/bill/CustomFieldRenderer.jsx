import React from 'react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Single-field renderer                                              */
/* ------------------------------------------------------------------ */

function FieldValue({ field }) {
  const { fieldType, value, label, width } = field;

  const blockStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    padding: '2px 0',
  };

  const lblStyle = { fontWeight: 600, color: '#444' };
  const valStyle = { color: '#222' };

  switch (fieldType) {
    /* ---------- date ---------- */
    case 'date':
      return (
        <div style={blockStyle}>
          <span style={lblStyle}>{label}:</span>
          <span style={valStyle}>{formatDate(value)}</span>
        </div>
      );

    /* ---------- textarea ---------- */
    case 'textarea':
      return (
        <div style={blockStyle}>
          <span style={lblStyle}>{label}:</span>
          <span style={{ ...valStyle, whiteSpace: 'pre-wrap' }}>
            {value || '-'}
          </span>
        </div>
      );

    /* ---------- checkbox ---------- */
    case 'checkbox':
      return (
        <div style={blockStyle}>
          <span style={lblStyle}>{label}:</span>
          <span style={valStyle}>{value ? '\u2611' : '\u2610'}</span>
        </div>
      );

    /* ---------- signature ---------- */
    case 'signature':
      return (
        <div
          style={{
            ...blockStyle,
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: width || '100%',
              height: 60,
              border: '1px solid #999',
              borderRadius: 2,
              backgroundColor: '#fafafa',
            }}
          />
          <span style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
            {label}
          </span>
        </div>
      );

    /* ---------- stampbox ---------- */
    case 'stampbox':
      return (
        <div
          style={{
            ...blockStyle,
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              border: '2px dotted #999',
              borderRadius: 4,
              backgroundColor: '#fafafa',
            }}
          />
          <span style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
            {label}
          </span>
        </div>
      );

    /* ---------- image ---------- */
    case 'image':
      return (
        <div
          style={{
            ...blockStyle,
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <span style={lblStyle}>{label}:</span>
          {value ? (
            <img
              src={value}
              alt={label}
              style={{
                maxWidth: width || 160,
                maxHeight: 100,
                objectFit: 'contain',
                marginTop: 2,
              }}
            />
          ) : (
            <span style={valStyle}>-</span>
          )}
        </div>
      );

    /* ---------- text / number / default ---------- */
    case 'text':
    case 'number':
    default:
      return (
        <div style={blockStyle}>
          <span style={lblStyle}>{label}:</span>
          <span style={valStyle}>
            {value !== undefined && value !== null && value !== ''
              ? String(value)
              : '-'}
          </span>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CustomFieldRenderer({
  fields = [],
  position = 'header',
}) {
  const filtered = fields.filter((f) => f.position === position);

  if (filtered.length === 0) return null;

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-1 py-1.5"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 24px',
        padding: '6px 0',
      }}
    >
      {filtered.map((f) => (
        <div key={f.id || f._id} style={{ width: f.width || '100%' }}>
          <FieldValue field={f} />
        </div>
      ))}
    </div>
  );
}
