import React from 'react';

/**
 * Accessible ProgressBar component for displaying course and lesson completion.
 */
export function ProgressBar({
  percentage = 0,
  label,
  completedCount,
  totalCount,
  size = 'md',
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
  const heightClass = size === 'sm' ? 'h-2' : 'h-2.5';

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        {label ? (
          <span className="font-medium text-brand-text">{label}</span>
        ) : (
          <span className="text-brand-muted">
            {typeof completedCount === 'number' && typeof totalCount === 'number'
              ? `${completedCount} / ${totalCount}`
              : ''}
          </span>
        )}
        <span className="font-bold text-brand-primary">{clamped}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-brand-accent/70 ${heightClass}`}
      >
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
