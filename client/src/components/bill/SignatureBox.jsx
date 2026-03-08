import React from 'react';

/* ------------------------------------------------------------------ */
/*  SignatureBox                                                        */
/*  Empty bordered box (60 px tall) with a centred label underneath.   */
/* ------------------------------------------------------------------ */

export default function SignatureBox({ label = 'Authorized Signatory' }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Signature area */}
      <div
        className="w-full border border-gray-400 rounded-sm bg-gray-50"
        style={{
          width: '100%',
          height: 60,
          border: '1px solid #9ca3af',
          borderRadius: 2,
          backgroundColor: '#fafafa',
        }}
      />

      {/* Label */}
      <span
        className="mt-1 text-[10px] text-gray-500 text-center"
        style={{
          marginTop: 4,
          fontSize: 10,
          color: '#666',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}
