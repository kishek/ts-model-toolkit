import { Identifiable } from './core/identifiable';
import { Payment } from './payment';

/**
 * A customer-facing invoice which is produced as a consequence of a payment.
 */
export interface Invoice extends Identifiable {
  /**
   * Free text representing details on the invoice.
   */
  details: string;

  /**
   * Payment this invoice is related to.
   */
  forPayment: Payment;
}
