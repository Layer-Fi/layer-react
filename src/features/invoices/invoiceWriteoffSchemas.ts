import { Schema, pipe } from 'effect'

export enum InvoiceWriteoffMode {
  Expense = 'EXPENSE',
  RevenueReversal = 'REVENUE_REVERSAL',
}
const InvoiceWriteoffModeSchema = Schema.Enums(InvoiceWriteoffMode)

export const TransformedInvoiceWriteoffModeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(InvoiceWriteoffModeSchema),
  {
    decode: (input) => {
      if (Object.values(InvoiceWriteoffModeSchema.enums).includes(input as InvoiceWriteoffMode)) {
        return input as InvoiceWriteoffMode
      }
      return InvoiceWriteoffMode.Expense
    },
    encode: input => input,
  },
)

export const CreateInvoiceWriteoffSchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),

  amount: Schema.Number,

  writeOffMode: Schema.optional(InvoiceWriteoffModeSchema).pipe(
    Schema.fromKey('write_off_mode'),
  ),

  writeOffAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('write_off_at'),
  ),

  referenceNumber: Schema.optional(Schema.String).pipe(
    Schema.fromKey('reference_number'),
  ),

  memo: Schema.optional(Schema.String),
})
export type CreateInvoiceWriteoff = typeof CreateInvoiceWriteoffSchema.Type

export const InvoiceWriteoffSchema = Schema.Struct({
  invoiceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('invoice_id'),
  ),

  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  amount: Schema.Number,

  writeOffMode: pipe(
    Schema.propertySignature(TransformedInvoiceWriteoffModeSchema),
    Schema.fromKey('write_off_mode'),
  ),

  writeOffAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('write_off_at'),
  ),

  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),

  memo: Schema.NullOr(Schema.String),
})
export type InvoiceWriteoff = typeof InvoiceWriteoffSchema.Type
