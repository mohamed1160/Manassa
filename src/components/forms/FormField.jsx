import React from 'react';

/**
 * Reusable accessible form field supporting input, textarea, and select elements.
 */
export function FormField({
  label,
  name,
  as = 'input', // 'input' | 'textarea' | 'select'
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  touched,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  options = [],
  dir,
  children,
}) {
  const hasError = Boolean(touched && error);
  const baseClassName = `w-full rounded-lg border px-3.5 py-2.5 text-sm text-brand-text transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-200'
      : 'border-brand-border bg-brand-surface focus:border-brand-primary focus:ring-brand-primary/20'
  } disabled:cursor-not-allowed disabled:bg-brand-bg`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-brand-text"
        >
          {label}
          {required && <span className="ms-1 text-red-600">*</span>}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          dir={dir}
          className={baseClassName}
        />
      ) : as === 'select' ? (
        <select
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          dir={dir}
          className={baseClassName}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          dir={dir}
          className={baseClassName}
        />
      )}

      {helperText && !hasError && (
        <p className="text-xs text-brand-muted">{helperText}</p>
      )}

      {hasError && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
