import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Reusable Mobile Navigation drawer content.
 */
export function MobileNavigation({
  isOpen,
  items = [],
  onClose,
  actionsSlot = null,
}) {
  if (!isOpen) return null;

  return (
    <div className="border-t border-brand-border bg-brand-surface px-4 pb-5 pt-3 md:hidden">
      <nav className="flex flex-col space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={Boolean(item.exact)}
            onClick={onClose}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? 'bg-brand-accent text-brand-primary'
                  : 'text-brand-muted hover:bg-brand-accent/30 hover:text-brand-text'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {actionsSlot && (
        <div className="mt-4 border-t border-brand-border pt-4">
          {actionsSlot}
        </div>
      )}
    </div>
  );
}

export default MobileNavigation;
