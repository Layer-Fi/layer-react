import { Schema } from 'effect'

export enum InvoiceStatus {
  Draft = 'DRAFT',
  Voided = 'VOIDED',
  Paid = 'PAID',
  WrittenOff = 'WRITTEN_OFF',
  PartiallyWrittenOff = 'PARTIALLY_WRITTEN_OFF',
  PartiallyPaid = 'PARTIALLY_PAID',
  Saved = 'SAVED',
  Refunded = 'REFUNDED',
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
      return InvoiceStatus.Saved
    },
    encode: input => input,
  },
)
