import React from 'react';

export function Card({ children, className = '', padding = 'p-6' }) {
  return (
    <div
      className={`rounded-xl border border-brand-border bg-brand-surface shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
