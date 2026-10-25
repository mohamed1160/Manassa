import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { StudentAccountNotice } from '../components/StudentAccountNotice';
import { studentsService } from '../services/students.service';
import { formatDate } from '../../../utils/formatters';
import { useTranslation } from '../../../hooks/useTranslation';

export function TeacherStudentsPage() {
  const { locale, t } = useTranslation();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await studentsService.listEnrolledStudents({ search });
      setStudents(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل قائمة الطلاب المشتركين.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const columns = [
    {
      key: 'student',
      header: 'اسم الطالب',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-text">{row.full_name || '—'}</p>
          <p dir="ltr" className="font-mono text-xs text-brand-muted">
            {row.email}
          </p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'رقم التواصل',
      render: (row) => (
        <span dir="ltr" className="font-mono text-xs text-brand-text">
          {row.phone || '—'}
        </span>
      ),
    },
    {
      key: 'courses',
      header: 'الدورات المشترك بها',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {(row.courses || []).map((c) => (
            <Badge key={c.id} variant="primary">
              {c.title}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'lastAccessedAt',
      header: 'آخر تواجد دراسي',
      render: (row) => (
        <span className="text-xs text-brand-muted">
          {formatDate(row.lastAccessedAt || row.created_at, locale)}
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('nav.manageStudents')}
        subtitle="استعرض قائمة الطلاب المشتركين فعلياً في دوراتك والدورات المفعلة لكل طالب."
        badgeText={t('nav.teacherPortal')}
      />

      <StudentAccountNotice />

      <Card padding="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 start-3 h-4 w-4 text-brand-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب، البريد الإلكتروني، أو رقم الهاتف..."
            className="w-full rounded-lg border border-brand-border bg-brand-bg py-2 ps-9 pe-3.5 text-xs text-brand-text focus:border-brand-primary focus:bg-brand-surface focus:outline-none"
          />
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={loadStudents} />}

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        emptyTitle="لا يوجد طلاب مشتركون حالياً"
        emptyDescription="يظهر الطلاب في هذا السجل تلقائياً فور اعتماد طلبات اشتراكهم في الدورات."
      />
    </PageContainer>
  );
}

export default TeacherStudentsPage;
