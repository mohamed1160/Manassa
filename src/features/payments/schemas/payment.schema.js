import * as Yup from 'yup';

export const manualPaymentSubmissionSchema = Yup.object({
  paymentMethodId: Yup.string().required('يرجى اختيار وسيلة الدفع المستخدمة'),
  senderIdentifier: Yup.string()
    .trim()
    .required('يرجى إدخال رقم الهاتف أو الحساب المحول منه'),
  transactionReference: Yup.string()
    .trim()
    .min(4, 'رقم العملية المرجعي قصير جداً')
    .required('رقم العملية المرجعي مطلوب للمراجعة'),
  notes: Yup.string().trim().max(300, 'الملاحظات لا تتجاوز 300 حرف'),
});

export default manualPaymentSubmissionSchema;
