import { pipe, Schema } from 'effect'

const InvoiceSummaryStatsSchema = Schema.Struct({
  overdueCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('overdue_count'),
  ),

  overdueTotal: pipe(
    Schema.propertySignature(Schema.BigIntFromNumber),
    Schema.fromKey('overdue_total'),
  ),

  sentCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('sent_count'),
  ),

  sentTotal: pipe(
    Schema.propertySignature(Schema.BigIntFromNumber),
    Schema.fromKey('sent_total'),
  ),
})

const InvoicePaymentsSummaryStatsSchema = Schema.Struct({
  sumTotal: pipe(
    Schema.propertySignature(Schema.BigIntFromNumber),
    Schema.fromKey('sum_total'),
  ),
})

export const InvoiceSummaryStatsResponseSchema = Schema.Struct({
  invoices: InvoiceSummaryStatsSchema,

  invoicePayments: pipe(
    Schema.propertySignature(InvoicePaymentsSummaryStatsSchema),
    Schema.fromKey('invoice_payments'),
  ),
})
export type InvoiceSummaryStatsResponse = typeof InvoiceSummaryStatsResponseSchema.Type
