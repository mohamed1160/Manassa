import { paymentConfig } from '../../config/payment.config';
import { requireSupabaseClient } from '../supabase/client';
import { STORAGE_BUCKETS } from '../supabase/storage';

/**
 * Manual Payment & Order Verification Service (`src/services/payments/payment.service.js`).
 *
 * SECURITY ARCHITECTURE:
 * 1. Frontend submission creates an order in `pending_review` state only.
 * 2. Receipts are uploaded to the private `payment-receipts` bucket.
 * 3. Course access (entitlement) is NEVER granted directly by client-side state;
 *    it is granted exclusively by the backend `review_manual_order` RPC function
 *    when an authorized teacher approves the order.
 */
export const paymentService = {
  getAvailablePaymentMethods() {
    return paymentConfig.methods.filter((method) => method.enabled);
  },

  async uploadReceiptImage(file) {
    const client = requireSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      throw new Error('يلزم تسجيل الدخول بحساب الطالب قبل رفع إيصال الدفع.');
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const filePath = `${session.user.id}/${Date.now()}-receipt.${ext}`;

    const { error } = await client.storage
      .from(STORAGE_BUCKETS.PAYMENT_RECEIPTS)
      .upload(filePath, file, { upsert: false });

    if (error) throw error;
    return filePath;
  },

  async getAuthorizedReceiptSignedUrl(receiptPath) {
    if (!receiptPath) return null;
    if (receiptPath.startsWith('http://') || receiptPath.startsWith('https://')) {
      return receiptPath;
    }

    const client = requireSupabaseClient();
    const { data, error } = await client.storage
      .from(STORAGE_BUCKETS.PAYMENT_RECEIPTS)
      .createSignedUrl(receiptPath, 300); // 5-minute signed URL for authorized review

    if (error) throw error;
    return data?.signedUrl || null;
  },
};

export default paymentService;
