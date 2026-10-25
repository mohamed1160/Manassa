import {
  supabase,
  isSupabaseConfigured,
  requireSupabaseClient,
} from '../../../services/supabase/client';
import { ORDER_STATUS } from '../../../constants/roles';

/**
 * Orders & Manual Payment Review Service (`src/features/orders/services/orders.service.js`).
 *
 * Security Rules:
 * - Students can only submit orders with `status = 'pending_review'` and view their own orders.
 * - Teacher approval/rejection invokes the database RPC `review_manual_order` which
 *   transactional-safely updates order status, creates the enrollment record, and emits a notification.
 */
export const ordersService = {
  async submitManualOrder({
    courseId,
    amount,
    currency = 'EGP',
    paymentMethodId,
    senderIdentifier,
    transactionReference,
    receiptPath = '',
    notes = '',
  }) {
    const client = requireSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      throw new Error('يلزم تسجيل الدخول بحساب الطالب لإرسال طلب الاشتراك.');
    }

    const payload = {
      student_id: session.user.id,
      course_id: courseId,
      amount: Number(amount) || 0,
      currency,
      payment_method: paymentMethodId,
      sender_identifier: senderIdentifier.trim(),
      transaction_reference: transactionReference.trim(),
      receipt_path: receiptPath,
      notes: (notes || '').trim(),
      status: ORDER_STATUS.PENDING_REVIEW,
    };

    const { data, error } = await client
      .from('orders')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listStudentOrders() {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        courses (
          id,
          title,
          slug
        )
      `
      )
      .eq('student_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async listTeacherOrders({ status = 'all', search = '' } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    let query = supabase
      .from('orders')
      .select(
        `
        *,
        courses (
          id,
          title,
          slug
        ),
        student:profiles!orders_student_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `
      )
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search.trim()) {
      query = query.or(
        `order_reference.ilike.%${search.trim()}%,transaction_reference.ilike.%${search.trim()}%,sender_identifier.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Calls the trusted backend RPC `review_manual_order` to approve or reject an order.
   * Never grants enrollment directly from client-side table writes.
   */
  async reviewOrderByTeacher({ orderId, decision, rejectionReason = '' }) {
    const client = requireSupabaseClient();

    const { data, error } = await client.rpc('review_manual_order', {
      p_order_id: orderId,
      p_decision: decision,
      p_rejection_reason: rejectionReason.trim(),
    });

    if (error) throw error;
    return data;
  },
};

export default ordersService;
