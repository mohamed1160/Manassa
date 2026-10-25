import React from 'react';

const VARIANT_CLASSES = {
  primary:
    'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-2 focus:ring-brand-primary/30',
  secondary:
    'bg-brand-accent text-brand-primary hover:bg-brand-primary hover:text-white focus:ring-2 focus:ring-brand-primary/20',
  dark:
    'bg-brand-dark text-white hover:bg-brand-primary-hover focus:ring-2 focus:ring-brand-dark/30',
  outline:
    'border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-accent/40 focus:ring-2 focus:ring-brand-border',
  ghost:
    'bg-transparent text-brand-muted hover:bg-brand-accent/50 hover:text-brand-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-200',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
