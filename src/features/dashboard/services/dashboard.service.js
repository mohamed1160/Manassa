import { supabase, isSupabaseConfigured } from '../../../services/supabase/client';

/**
 * Teacher Analytics & Dashboard Aggregation Service (`src/features/dashboard/services/dashboard.service.js`).
 *
 * DATA INTEGRITY RULES:
 * - Never hardcodes statistics or generates random chart values.
 * - Never counts unapproved (`pending_review` / `rejected`) orders as verified sales.
 * - Deduplicates `student_id` across `enrollments` so unique student totals are exact.
 * - Distinguishes gross submitted order volume from verified (`approved`) sales revenue.
 */
export const dashboardService = {
  async getTeacherAnalytics({ periodDays = 30 } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return {
        isDataAvailable: false,
        publishedCoursesCount: 0,
        uniqueEnrolledStudentsCount: 0,
        pendingPaymentReviewsCount: 0,
        totalSubmittedOrdersCount: 0,
        approvedOrdersCount: 0,
        verifiedApprovedSalesAmount: 0,
        grossSubmittedOrdersAmount: 0,
        recentOrders: [],
        salesTrend: [],
      };
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - Number(periodDays || 30));
    const sinceIso = sinceDate.toISOString();

    const [coursesRes, enrollmentsRes, ordersRes] = await Promise.all([
      supabase.from('courses').select('id, status'),
      supabase.from('enrollments').select('student_id, course_id, granted_at'),
      supabase
        .from('orders')
        .select(
          `
          id,
          order_reference,
          amount,
          currency,
          status,
          payment_method,
          created_at,
          reviewed_at,
          courses ( id, title ),
          student:profiles!orders_student_id_fkey ( id, full_name, email )
        `
        )
        .order('created_at', { ascending: false }),
    ]);

    if (coursesRes.error) throw coursesRes.error;
    if (enrollmentsRes.error) throw enrollmentsRes.error;
    if (ordersRes.error) throw ordersRes.error;

    const courses = coursesRes.data || [];
    const enrollments = enrollmentsRes.data || [];
    const orders = ordersRes.data || [];

    const publishedCoursesCount = courses.filter(
      (c) => c.status === 'published'
    ).length;

    const uniqueStudentIds = new Set(
      enrollments.map((e) => e.student_id).filter(Boolean)
    );
    const uniqueEnrolledStudentsCount = uniqueStudentIds.size;

    const pendingPaymentReviewsCount = orders.filter(
      (o) => o.status === 'pending_review'
    ).length;

    const totalSubmittedOrdersCount = orders.length;
    const approvedOrders = orders.filter((o) => o.status === 'approved');
    const approvedOrdersCount = approvedOrders.length;

    const verifiedApprovedSalesAmount = approvedOrders.reduce(
      (sum, o) => sum + (Number(o.amount) || 0),
      0
    );

    const grossSubmittedOrdersAmount = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    // Aggregate verified approved sales within the selected period by date (YYYY-MM-DD)
    const trendMap = new Map();
    for (const ord of approvedOrders) {
      const effectiveDate = ord.reviewed_at || ord.created_at;
      if (effectiveDate && effectiveDate >= sinceIso) {
        const dayKey = effectiveDate.slice(0, 10);
        const prev = trendMap.get(dayKey) || { date: dayKey, amount: 0, count: 0 };
        trendMap.set(dayKey, {
          date: dayKey,
          amount: prev.amount + (Number(ord.amount) || 0),
          count: prev.count + 1,
        });
      }
    }

    const salesTrend = Array.from(trendMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return {
      isDataAvailable: true,
      publishedCoursesCount,
      uniqueEnrolledStudentsCount,
      pendingPaymentReviewsCount,
      totalSubmittedOrdersCount,
      approvedOrdersCount,
      verifiedApprovedSalesAmount,
      grossSubmittedOrdersAmount,
      recentOrders: orders.slice(0, 5),
      salesTrend,
    };
  },
};

export default dashboardService;
