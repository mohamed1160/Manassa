import { siteConfig } from './site.config';

/**
 * Manual Payment & Verification Configuration for Teacher Deployments.
 *
 * Note: Payment verification and course enrollment activation must be enforced
 * via backend database policies (Supabase RLS) and teacher approval workflows.
 */
export const paymentConfig = {
  currency: siteConfig.localization.currency,
  currencySymbol: siteConfig.localization.currencySymbol,
  verificationMode: 'manual_receipt', // Initial foundation supports manual reference + receipt upload
  requireReceiptImage: true,
  requireTransactionReference: true,

  methods: [
    {
      id: 'vodafone_cash',
      label: 'فودافون كاش (Vodafone Cash)',
      enabled: true,
      instructions: 'يتم التحويل إلى رقم المحفظة المخصص ثم إرفاق رقم العملية وصورة الإيصال.',
      accountIdentifier: siteConfig.contact.phone,
    },
    {
      id: 'instapay',
      label: 'إنستا باي (InstaPay)',
      enabled: true,
      instructions: 'يتم التحويل عبر تطبيق InstaPay وإدخال الرقم المرجعي للتحويل.',
      accountIdentifier: 'teacher@instapay',
    },
  ],
};

export default paymentConfig;
