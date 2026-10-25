import { paymentService } from '../../../services/payments/payment.service';

/**
 * Feature-level payment submission wrapper (`src/features/payments/services/paymentSubmission.service.js`).
 */
export const paymentSubmissionService = {
  getMethods() {
    return paymentService.getAvailablePaymentMethods();
  },

  async submitReceipt(payload) {
    return paymentService.submitManualPaymentRequest(payload);
  },
};

export default paymentSubmissionService;
