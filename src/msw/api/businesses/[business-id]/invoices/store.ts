import { createMockStore } from '@msw/utils/createMockStore'
import { invoices } from '@fixtures/generated/invoices.gen'
import { makeInvoice } from '@fixtures/invoices/mocks'

export const invoiceStore = createMockStore(() => invoices)

/*
 * Custom action handlers (finalize, payment, write-off, refund) mutate an
 * invoice in place. Seed a fallback when the id isn't in the store, so the
 * mutation is always reflected in the invoice the UI reads back.
 */
export const findOrSeedInvoice = (invoiceId: string) =>
  invoiceStore.findById(invoiceId) ?? makeInvoice({ id: invoiceId })
