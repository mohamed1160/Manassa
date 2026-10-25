import React from 'react';
import { Wallet } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { paymentSubmissionService } from '../services/paymentSubmission.service';

export function PaymentMethodsSummary() {
  const methods = paymentSubmissionService.getMethods();

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 text-brand-primary">
        <Wallet className="h-5 w-5" />
        <h3 className="text-base font-bold text-brand-text">
          وسائل الدفع اليدوي المهيأة في إعدادات المنصة (payment.config.js)
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {methods.map((method) => (
          <div
            key={method.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs"
          >
            <p className="font-bold text-brand-text">{method.label}</p>
            <p className="mt-1 text-brand-muted">{method.instructions}</p>
            <p className="mt-2 font-mono text-brand-primary" dir="ltr">
              {method.accountIdentifier}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default PaymentMethodsSummary;
