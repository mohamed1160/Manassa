import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ROUTES } from '../../../constants/routes';

/**
 * Structural placeholder card showing how a course slot will be rendered
 * once real courses are loaded from Supabase (no fabricated statistics or fake prices).
 */
export function CourseStructureCard() {
  return (
    <Card className="flex flex-col justify-between space-y-4 border-dashed border-slate-300 bg-slate-50/60">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="neutral">قالب بطاقة دورة</Badge>
          <BookOpen className="h-5 w-5 text-brand-primary" />
        </div>
        <h3 className="text-base font-bold text-brand-text">
          موضع عرض بيانات الدورة التدريبية
        </h3>
        <p className="text-xs leading-relaxed text-brand-muted">
          ستظهر هنا الصورة المصغرة للدورة، العنوان، الوصف المختصر، والسعر الفعلي المحدد من قِبل المعلم بعد جلب السجلات من قاعدة البيانات.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
        <span className="text-xs text-brand-muted">معاينة هيكل الصفحة</span>
        <Link
          to={ROUTES.getCourseDetailsPath('sample-course-slug')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
        >
          <span>صفحة تفاصيل الدورة</span>
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>
    </Card>
  );
}

export default CourseStructureCard;
