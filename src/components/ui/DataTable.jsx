import React from 'react';
import { EmptyState } from '../feedback/EmptyState';
import { LoadingState } from '../feedback/LoadingState';

/**
 * Reusable responsive DataTable component with built-in loading and empty states.
 */
export function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  isLoading = false,
  loadingMessage,
  emptyTitle,
  emptyDescription,
  emptyAction,
}) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-bg text-xs font-bold uppercase text-brand-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3.5 text-start font-bold ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {data.map((row, idx) => (
              <tr
                key={row[rowKey] || idx}
                className="transition-colors hover:bg-brand-bg/60"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 align-middle text-brand-text ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
