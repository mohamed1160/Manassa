import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function StudentAccountNotice() {
  return (
    <Card className="flex items-start gap-3 bg-slate-50/70">
      <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
      <div className="space-y-1 text-xs text-brand-muted">
        <p className="font-bold text-brand-text">بنية ملفات تعريف الطلاب (Profiles)</p>
        <p>
          ترتبط بيانات الطالب بجدول <code className="font-mono">profiles</code> في Supabase مع صلاحيات RLS تضمن أن كل طالب يقرأ ويعدل ملفه الشخصي فقط، بينما يمتلك المعلم صلاحية عرض قائمة الطلاب المشتركين لديه.
        </p>
      </div>
    </Card>
  );
}

export default StudentAccountNotice;
