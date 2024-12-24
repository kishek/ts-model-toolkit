import { CreateInvoiceCommand, Invoice } from "./../../model/invoice";

export const createInvoice = async (
  _: unknown,
  args: { input: CreateInvoiceCommand },
  ctx: any,
): Promise<Invoice> => {
  return {} as any;
};
