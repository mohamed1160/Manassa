import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

/**
 * Renders navigation cards for dashboard sub-modules without fake counters or fabricated metrics.
 */
export function DashboardModuleOverview({ modules = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => (
        <Card key={mod.path} className="flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-brand-text">{mod.title}</h3>
            <p className="text-xs leading-relaxed text-brand-muted">
              {mod.description}
            </p>
          </div>
          <Link
            to={mod.path}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
          >
            <span>الانتقال إلى القسم</span>
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </Card>
      ))}
    </div>
  );
}

export default DashboardModuleOverview;
