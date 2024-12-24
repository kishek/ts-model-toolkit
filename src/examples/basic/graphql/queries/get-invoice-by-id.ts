import { GetInvoiceByIdQuery, Invoice } from "./../../model/invoice";

export const getInvoiceById = async (
  _: unknown,
  args: { input: GetInvoiceByIdQuery },
  ctx: any,
): Promise<Invoice> => {
  return {} as any;
};
