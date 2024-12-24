import { createInvoice } from "./mutations/create-invoice";
import { getInvoiceById } from "./queries/get-invoice-by-id";

export const resolvers = {
  Query: { getInvoiceById },
  Mutation: { createInvoice },
};
