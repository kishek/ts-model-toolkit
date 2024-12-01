import { ComposedOf } from './core/composition';
import { Identifiable } from './core/identifiable';
import { Payment } from './payment';

/**
 * A customer, who is able to able make payments.
 */
export interface Customer extends Identifiable {
  /**
   * Full name of a customer.
   */
  fullName: string;

  /**
   * Email of the customer.
   */
  emailAddress: string;

  /**
   * Payments made by a customer.
   */
  payments: ComposedOf<Payment>;
}
