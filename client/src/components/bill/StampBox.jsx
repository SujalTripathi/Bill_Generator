import React from 'react';

/* ------------------------------------------------------------------ */
/*  StampBox                                                           */
/*  Dotted-border square (80 x 80 px) with a centred label below.     */
/* ------------------------------------------------------------------ */

export default function StampBox({ label = 'Stamp' }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Stamp area */}
      <div
        className="border-2 border-dotted border-gray-400 rounded bg-gray-50"
        style={{
          width: 80,
          height: 80,
          border: '2px dotted #9ca3af',
          borderRadius: 4,
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
