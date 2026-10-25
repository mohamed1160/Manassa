import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Reusable Sidebar Navigation component used across Student and Teacher layouts.
 */
export function SidebarNavigation({
  title,
  subtitle,
  items = [],
  iconMap = {},
  defaultIcon: DefaultIcon,
  footerSlot = null,
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {(title || subtitle) && (
          <div className="mb-4 rounded-xl border border-brand-border bg-brand-bg p-3">
            {title && (
              <p className="text-xs font-medium text-brand-muted">{title}</p>
            )}
            {subtitle && (
              <p className="text-sm font-bold text-brand-primary">{subtitle}</p>
            )}
          </div>
        )}

        <nav className="space-y-1" aria-label={title || 'Sidebar Navigation'}>
          {items.map((item) => {
            const IconComponent = iconMap[item.icon] || DefaultIcon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.exact)}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-muted hover:bg-brand-accent/40 hover:text-brand-text'
                  }`
                }
              >
                {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {footerSlot && (
        <div className="mt-6 border-t border-brand-border pt-4">{footerSlot}</div>
      )}
    </div>
  );
}

export default SidebarNavigation;
