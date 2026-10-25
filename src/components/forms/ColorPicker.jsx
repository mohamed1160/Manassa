import React from 'react';
import { sanitizeHexColor } from '../../utils/theme';

/**
 * Accessible Color Picker control with synchronized color swatch and Hex input.
 */
export function ColorPicker({
  label,
  name,
  value = '#173F35',
  onChange,
  helperText,
  disabled = false,
}) {
  const safeHex = sanitizeHexColor(value, '#173F35');

  const handleHexChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-brand-text"
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2.5 rounded-lg border border-brand-border bg-brand-surface p-2">
        <input
          id={`${name}-swatch`}
          type="color"
          value={safeHex}
          disabled={disabled}
          onChange={handleHexChange}
          aria-label={label || name}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-brand-border bg-transparent p-0.5 disabled:cursor-not-allowed"
        />
        <input
          id={name}
          name={name}
          type="text"
          dir="ltr"
          value={value}
          disabled={disabled}
          onChange={handleHexChange}
          placeholder="#173F35"
          maxLength={7}
          className="w-full bg-transparent font-mono text-xs font-semibold text-brand-text focus:outline-none"
        />
      </div>

      {helperText && <p className="text-[11px] text-brand-muted">{helperText}</p>}
    </div>
  );
}

export default ColorPicker;
