import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import { CustomerSchema } from '@schemas/customerVendor/customer'
import { TransformedInvoiceStatusSchema } from '@schemas/invoices/invoiceStatus'
import { TransactionTagSchema } from '@schemas/tags/tag'

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

  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('transaction_tags'),
  ),

  accountIdentifier: pipe(
    Schema.propertySignature(Schema.NullOr(AccountIdentifierSchema)),
    Schema.fromKey('account_identifier'),
  ),
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
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('imported_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Date)),
    Schema.fromKey('updated_at'),
  ),

  memo: Schema.NullOr(Schema.String),

  customPaymentInstructions: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('custom_payment_instructions'),
  ),
})
export type Invoice = typeof InvoiceSchema.Type
