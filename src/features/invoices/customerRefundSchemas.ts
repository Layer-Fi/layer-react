import { Schema, pipe } from 'effect'
import { PaymentMethodSchema } from '@components/PaymentMethod/schemas'

export enum CustomerRefundStatus {
  Paid = 'PAID',
  PartiallyPaid = 'PARTIALLY_PAID',
  Sent = 'SENT',
}
const CustomerRefundStatusSchema = Schema.Enums(CustomerRefundStatus)

export const TransformedCustomerRefundStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CustomerRefundStatusSchema),
  {
    decode: (input) => {
      if (Object.values(CustomerRefundStatusSchema.enums).includes(input as CustomerRefundStatus)) {
        return input as CustomerRefundStatus
      }
      return CustomerRefundStatus.Sent
    },
    encode: input => input,
  },
)

export const CreateCustomerRefundSchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),

  refundedAmount: Schema.optional(Schema.Number).pipe(
    Schema.fromKey('refunded_amount'),
  ),

  completedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('completed_at'),
  ),

  method: PaymentMethodSchema,

  referenceNumber: Schema.optional(Schema.String).pipe(
    Schema.fromKey('reference_number'),
  ),

  memo: Schema.optional(Schema.String),
})
export type CreateCustomerRefund = typeof CreateCustomerRefundSchema.Type

export const CustomerRefundSchema = Schema.Struct({
  externalId: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  refundedAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('refunded_amount'),
  ),

  status: TransformedCustomerRefundStatusSchema,

  completedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('completed_at'),
  ),

  isDedicated: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_dedicated'),
  ),

  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),

  memo: Schema.NullOr(Schema.String),
})
export type CustomerRefund = typeof CustomerRefundSchema.Type
