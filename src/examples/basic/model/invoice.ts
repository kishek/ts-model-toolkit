import { AggregatedBy } from './core/aggregation';
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

/**
 * A customer-facing invoice group, containing a batch of invoices, typically representing a group of purchases.
 */
export interface InvoiceGroup extends Identifiable {
  /**
   * List of invoices associated with this group.
   */
  invoices: AggregatedBy<Invoice>;
}

/**
 * Create an invoice for a customer
 * @returns Invoice
 */
export interface CreateInvoiceCommand {
  /**
   * Free text representing details on the invoice.
   */
  details: string;

  /**
   * ID referring to the payment this invoice is related to.
   */
  forPayment: string;
}

/**
 * Get an invoice by its ID
 * @returns Invoice
 */
export interface GetInvoiceByIdQuery {
  /**
   * Lookup an invoice by ID.
   */
  id: string;
}
