import { Identifiable } from './core/identifiable';
import { Customer } from './customer';
import { Invoice } from './invoice';

/**
 * A payment envelope representing a customer's issued payment to a system
 */
export interface Payment extends Identifiable {
  /**
   * Free text representing details on the payment.
   */
  details: string;

  /**
   * Customer who made the payment is for.
   */
  madeBy: Customer;

  /**
   * Invoice associated with the payment.
   */
  invoice: Invoice;
}
