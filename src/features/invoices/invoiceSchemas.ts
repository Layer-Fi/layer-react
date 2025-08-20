import { Schema, pipe } from 'effect'
import { CustomerSchema } from '../../schemas/customer'
import { InvoiceTermsValues } from '../../components/Invoices/InvoiceTermsComboBox/InvoiceTermsComboBox'
import { ZonedDateTimeFromSelf } from '../../utils/schema/utils'

export enum InvoiceStatus {
  Voided = 'VOIDED',
  Paid = 'PAID',
  WrittenOff = 'WRITTEN_OFF',
  PartiallyWrittenOff = 'PARTIALLY_WRITTEN_OFF',
  PartiallyPaid = 'PARTIALLY_PAID',
  Sent = 'SENT',
}
const InvoiceStatusSchema = Schema.Enums(InvoiceStatus)

export const TransformedInvoiceStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(InvoiceStatusSchema),
  {
    decode: (input) => {
      if (Object.values(InvoiceStatusSchema.enums).includes(input as InvoiceStatus)) {
        return input as InvoiceStatus
      }
      return InvoiceStatus.Sent
    },
    encode: input => input,
  },
)

export const InvoiceLineItemSchema = Schema.Struct({
  id: Schema.UUID,

  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  invoiceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('invoice_id'),
  ),

  description: Schema.NullOr(Schema.String),

  product: Schema.NullOr(Schema.String),

  unitPrice: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('unit_price'),
  ),

  quantity: Schema.BigDecimal,

  subtotal: Schema.Number,

  discountAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('discount_amount'),
  ),

  salesTaxTotal: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('sales_taxes_total'),
  ),

  totalAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_amount'),
  ),

  memo: Schema.NullOr(Schema.String),
})
export type InvoiceLineItem = typeof InvoiceLineItemSchema.Type

export const InvoiceSchema = Schema.Struct({
  id: Schema.UUID,

  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),

  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  status: TransformedInvoiceStatusSchema,

  sentAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('sent_at'),
  ),

  dueAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('due_at'),
  ),

  paidAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('paid_at'),
  ),

  voidedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('voided_at'),
  ),

  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),

  recipientName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('recipient_name'),
  ),

  customer: Schema.NullOr(CustomerSchema),

  lineItems: pipe(
    Schema.propertySignature(Schema.Array(InvoiceLineItemSchema)),
    Schema.fromKey('line_items'),
  ),

  subtotal: Schema.Number,

  additionalDiscount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('additional_discount'),
  ),

  additionalSalesTaxesTotal: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('additional_sales_taxes_total'),
  ),

  totalAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_amount'),
  ),

  outstandingBalance: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('outstanding_balance'),
  ),

  importedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('imported_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('updated_at'),
  ),

  memo: Schema.NullOr(Schema.String),
})
export type Invoice = typeof InvoiceSchema.Type

export const UpsertInvoiceTaxLineItemSchema = Schema.Struct({
  amount: Schema.Number,
})

export const UpsertInvoiceLineItemSchema = Schema.Struct({
  description: Schema.String,

  product: Schema.String,

  unitPrice: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('unit_price'),
  ),

  quantity: Schema.BigDecimal,

  salesTaxes: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.Array(UpsertInvoiceTaxLineItemSchema))),
    Schema.fromKey('sales_taxes'),
  ),
})
export type UpsertInvoiceLineItem = typeof UpsertInvoiceLineItemSchema.Type

export const UpsertInvoiceSchema = Schema.Struct({
  sentAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('sent_at'),
  ),

  dueAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('due_at'),
  ),

  invoiceNumber: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),

  customerId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('customer_id'),
  ),

  memo: Schema.NullOr(Schema.String),

  lineItems: pipe(
    Schema.propertySignature(Schema.Array(UpsertInvoiceLineItemSchema)),
    Schema.fromKey('line_items'),
  ),

  additionalDiscount: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.Number)),
    Schema.fromKey('additional_discount'),
  ),
})
export type UpsertInvoice = typeof UpsertInvoiceSchema.Type

export const InvoiceFormLineItemSchema = Schema.Struct({
  description: Schema.String,

  product: Schema.String,

  unitPrice: Schema.BigDecimal,

  quantity: Schema.BigDecimal,

  amount: Schema.BigDecimal,

  isTaxable: Schema.Boolean,
})
export type InvoiceFormLineItem = typeof InvoiceFormLineItemSchema.Type
export const InvoiceFormLineItemEquivalence = Schema.equivalence(InvoiceFormLineItemSchema)

const InvoiceTermsValuesSchema = Schema.Enums(InvoiceTermsValues)
export const InvoiceFormSchema = Schema.Struct({
  terms: InvoiceTermsValuesSchema,

  sentAt: Schema.NullOr(ZonedDateTimeFromSelf),

  dueAt: Schema.NullOr(ZonedDateTimeFromSelf),

  invoiceNumber: Schema.String,

  customer: Schema.NullOr(CustomerSchema),

  email: Schema.String,

  address: Schema.String,

  lineItems: Schema.Array(InvoiceFormLineItemSchema),

  discountRate: Schema.BigDecimal,

  taxRate: Schema.BigDecimal,

  memo: Schema.String,
})
export type InvoiceForm = Omit<typeof InvoiceFormSchema.Type, 'lineItems'> & {
  // Purposefully allow lineItems to be mutable for `field.pushValue` in the form
  lineItems: InvoiceFormLineItem[]
}

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
