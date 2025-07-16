import { Schema, pipe } from 'effect'
import { CustomerSchema } from '../customers/customersSchemas'

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

export const UpsertInvoiceTaxLineItemSchema = Schema.Struct({
  amount: Schema.NumberFromString.pipe(Schema.int()),
})

export const UpsertInvoiceLineItemSchema = Schema.Struct({
  description: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.String)),
    Schema.fromKey('description'),
  ),

  product: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('product'),
  ),

  unitPrice: pipe(
    Schema.propertySignature(Schema.NumberFromString.pipe(Schema.int())),
    Schema.fromKey('unit_price'),
  ),

  quantity: pipe(
    Schema.propertySignature(Schema.BigDecimal),
    Schema.fromKey('quantity'),
  ),
})

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
    Schema.propertySignature(Schema.UndefinedOr(Schema.NumberFromString.pipe(Schema.int()))),
    Schema.fromKey('additional_discount'),
  ),

  additionalSalesTaxes: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.Array(UpsertInvoiceTaxLineItemSchema))),
    Schema.fromKey('additional_sales_taxes'),
  ),
})

export type Invoice = typeof InvoiceSchema.Type
export type UpsertInvoice = typeof UpsertInvoiceSchema.Type
