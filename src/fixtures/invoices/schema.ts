import { Arbitrary, Schema } from 'effect'

import { InvoiceSchema, InvoiceStatus } from '@schemas/invoices/invoice'

import { makeBusiness } from '@fixtures/business/mocks'
import {
  invoiceCustomerArbitrary,
  invoiceLineItemsArbitrary,
  invoiceStatusArbitrary,
} from '@fixtures/invoices/arbitrary'
import { invoiceMemos, invoicePaymentInstructions, invoiceRecipientNames } from '@fixtures/invoices/constants'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const BUSINESS_ID = makeBusiness().id

const fields = InvoiceSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.invoice)),
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  externalId: withArbitrary(fields.externalId, () => fc => fc.constant(null)),
  status: withArbitrary(fields.status, () => invoiceStatusArbitrary),
  // Every date is a placeholder — the generator respreads sentAt across the
  // fixture year and rederives the others from it.
  sentAt: withArbitrary(fields.sentAt, () => dateArbitrary),
  dueAt: withArbitrary(fields.dueAt, () => dateArbitrary),
  paidAt: withArbitrary(fields.paidAt, () => fc => fc.constant(null)),
  voidedAt: withArbitrary(fields.voidedAt, () => fc => fc.constant(null)),
  invoiceNumber: withArbitrary(fields.invoiceNumber, () => fc => fc.constant(null)),
  recipientName: withArbitrary(fields.recipientName, () => fc => fc.constantFrom(...invoiceRecipientNames)),
  customer: withArbitrary(fields.customer, () => invoiceCustomerArbitrary),
  lineItems: withArbitrary(fields.lineItems, () => invoiceLineItemsArbitrary),
  subtotal: withArbitrary(fields.subtotal, () => fc => fc.constant(0)),
  additionalDiscount: withArbitrary(fields.additionalDiscount, () => fc => fc.constant(0)),
  additionalSalesTaxesTotal: withArbitrary(fields.additionalSalesTaxesTotal, () => fc => fc.constant(0)),
  totalAmount: withArbitrary(fields.totalAmount, () => fc => fc.constant(0)),
  outstandingBalance: withArbitrary(fields.outstandingBalance, () => fc => fc.constant(0)),
  importedAt: withArbitrary(fields.importedAt, () => fc => fc.constant(null)),
  updatedAt: withArbitrary(fields.updatedAt, () => fc => fc.constant(null)),
  memo: withArbitrary(fields.memo, () => nullableConstantFrom(invoiceMemos, { nullWeight: 2, valueWeight: 1 })),
  customPaymentInstructions: withArbitrary(
    fields.customPaymentInstructions,
    () => nullableConstantFrom(invoicePaymentInstructions, { nullWeight: 3, valueWeight: 1 }),
  ),
})

const PARTIAL_PAYMENT_FRACTIONS = [0.25, 0.5, 0.75]

/*
 * Rederives every amount from the line items and forces the balance/date
 * combination each status implies, so a fixture can never contradict itself.
 */
const applyInvoiceInvariants = (invoice: typeof base.Type): typeof base.Type => {
  const lineItems = invoice.lineItems.map(lineItem => ({ ...lineItem, invoiceId: invoice.id }))
  const subtotal = lineItems.reduce((sum, lineItem) => sum + lineItem.subtotal, 0)
  const additionalSalesTaxesTotal = lineItems.reduce((sum, lineItem) => sum + lineItem.salesTaxTotal, 0)
  const totalAmount = lineItems.reduce((sum, lineItem) => sum + lineItem.totalAmount, 0)

  const paidFraction = PARTIAL_PAYMENT_FRACTIONS[Math.floor(subtotal / 100) % PARTIAL_PAYMENT_FRACTIONS.length]

  const outstandingBalance = (() => {
    switch (invoice.status) {
      case InvoiceStatus.Draft:
      case InvoiceStatus.Saved:
        return totalAmount
      case InvoiceStatus.PartiallyPaid:
        return Math.max(1, Math.round(totalAmount * (1 - paidFraction)))
      default:
        return 0
    }
  })()

  const isPaid = invoice.status === InvoiceStatus.Paid || invoice.status === InvoiceStatus.Refunded
  const isDraft = invoice.status === InvoiceStatus.Draft

  return {
    ...invoice,
    lineItems,
    subtotal,
    additionalDiscount: 0,
    additionalSalesTaxesTotal,
    totalAmount,
    outstandingBalance,
    sentAt: isDraft ? null : invoice.sentAt,
    dueAt: isDraft ? null : invoice.dueAt,
    paidAt: isPaid ? invoice.sentAt : null,
    voidedAt: invoice.status === InvoiceStatus.Voided ? invoice.sentAt : null,
    recipientName: invoice.customer != null
      ? invoice.customer.companyName ?? invoice.customer.individualName
      : invoice.recipientName,
  }
}

const baseArbitrary = Arbitrary.make(base)

export const InvoiceArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((invoice): typeof base.Type => applyInvoiceInvariants(invoice)),
})

export const schema = InvoiceArbitrarySchema
