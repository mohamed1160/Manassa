import React from 'react';
import { Card } from '../ui/Card';

/**
 * Reusable SettingsSection container for grouping settings fields cleanly.
 */
export function SettingsSection({ title, description, icon: Icon, children }) {
  return (
    <Card className="space-y-5">
      <div className="border-b border-brand-border pb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="rounded-lg bg-brand-accent p-2 text-brand-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-brand-primary">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export default SettingsSection;
