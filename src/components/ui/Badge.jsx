import React from 'react';

const BADGE_VARIANTS = {
  neutral: 'bg-brand-bg text-brand-muted border-brand-border',
  primary: 'bg-brand-accent text-brand-primary border-brand-border',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-brand-accent/60 text-brand-dark border-brand-border',
};

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantClasses = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
