import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import { TagKeyValueSchema } from '@schemas/tags/tag'

export const UpsertInvoiceTaxLineItemSchema = Schema.Struct({
  amount: Schema.Number,
})

export const UpsertInvoiceLineItemSchema = Schema.Struct({
  description: Schema.String,

  unitPrice: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('unit_price'),
  ),

  quantity: Schema.BigDecimal,

  salesTaxes: Schema.optional(Schema.Array(UpsertInvoiceTaxLineItemSchema)).pipe(
    Schema.fromKey('sales_taxes'),
  ),

  accountIdentifier: Schema.optional(AccountIdentifierSchema).pipe(
    Schema.fromKey('account_identifier'),
  ),

  tags: Schema.optional(Schema.Array(TagKeyValueSchema)),
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

  invoiceNumber: Schema.optional(Schema.String).pipe(
    Schema.fromKey('invoice_number'),
  ),

  customerId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('customer_id'),
  ),

  memo: Schema.optional(Schema.String),

  customPaymentInstructions: Schema.optional(Schema.String).pipe(
    Schema.fromKey('custom_payment_instructions'),
  ),

  lineItems: pipe(
    Schema.propertySignature(Schema.Array(UpsertInvoiceLineItemSchema)),
    Schema.fromKey('line_items'),
  ),

  additionalDiscount: Schema.optional(Schema.Number).pipe(
    Schema.fromKey('additional_discount'),
  ),
})
export type UpsertInvoice = typeof UpsertInvoiceSchema.Type
