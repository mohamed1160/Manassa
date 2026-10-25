import React from 'react';
import { Badge } from '../ui/Badge';

/**
 * Reusable page title and action bar used across Public, Student, and Teacher pages.
 */
export function PageHeader({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'primary',
  actions = null,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-brand-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
        <h1 className="text-2xl font-bold tracking-tight text-brand-primary sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl text-sm leading-relaxed text-brand-muted sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
