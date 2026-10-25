import React from 'react';
import { FileCheck2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function OrderVerificationInfo() {
  return (
    <Card className="flex items-start gap-3 bg-amber-50/60 border-amber-200">
      <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
      <div className="space-y-1 text-xs text-amber-950">
        <p className="font-bold">آلية التحقق اليدوي من المدفوعات وتفعيل الاشتراك</p>
        <p className="leading-relaxed text-amber-900">
          يرسل الطالب رقم العملية المرجعي وصورة إيصال التحويل، وتكون حالة الطلب المبدئية{' '}
          <code className="font-mono font-semibold">pending_review</code>. لا يتم منح صلاحية مشاهدة الدروس إلا بعد اعتماد المعلم للطلب وتحديث حالته في الخادم إلى{' '}
          <code className="font-mono font-semibold">approved</code>.
        </p>
      </div>
    </Card>
  );
}

export default OrderVerificationInfo;
