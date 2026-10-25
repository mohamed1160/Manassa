import React from 'react';
import { CheckCircle2, Clock, FileEdit, Archive, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useTranslation } from '../../hooks/useTranslation';

const STATUS_META = {
  published: { variant: 'primary', Icon: CheckCircle2 },
  approved: { variant: 'primary', Icon: CheckCircle2 },
  draft: { variant: 'neutral', Icon: FileEdit },
  pending_payment: { variant: 'warning', Icon: Clock },
  pending_review: { variant: 'warning', Icon: Clock },
  archived: { variant: 'neutral', Icon: Archive },
  rejected: { variant: 'danger', Icon: XCircle },
  cancelled: { variant: 'neutral', Icon: XCircle },
};

/**
 * Accessible status badge for courses and orders.
 * Uses both icon + text label so status is never communicated by color alone.
 */
export function CourseStatusBadge({ status = 'draft' }) {
  const { t } = useTranslation();
  const meta = STATUS_META[status] || STATUS_META.draft;
  const Icon = meta.Icon;
  const label = t(`status.${status}`);

  return (
    <Badge variant={meta.variant}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </Badge>
  );
}

export default CourseStatusBadge;
