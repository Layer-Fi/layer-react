import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/common/utils'
import { MinimalBankTransactionSchema } from '@schemas/features/bankTransactions/base'
import { MatchDetailsWithFallbackSchema } from '@schemas/features/bankTransactions/matchDetails'

export enum MatchType {
  TRANSFER = 'TRANSFER',
  INVOICE_PAYMENT = 'INVOICE_PAYMENT',
  PAYOUT = 'PAYOUT',
  VENDOR_PAYOUT = 'VENDOR_PAYOUT',
  REFUND_PAYMENT = 'REFUND_PAYMENT',
  VENDOR_REFUND_PAYMENT = 'VENDOR_REFUND_PAYMENT',
  MANUAL_JOURNAL_ENTRY = 'MANUAL_JOURNAL_ENTRY',
  BILL_PAYMENT = 'BILL_PAYMENT',
  PAYROLL_PAYMENT = 'PAYROLL_PAYMENT',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  LOAN_PROCEED = 'LOAN_PROCEED',
  Unknown = 'UNKNOWN',
}
export const MatchTypeSchema = Schema.Enums(MatchType)
export const TransformedMatchTypeSchema = createTransformedEnumSchema(
  MatchTypeSchema,
  MatchType,
  MatchType.Unknown,
)

export const SuggestedMatchSchema = Schema.Struct({
  id: Schema.String,
  // omitting matchType since it is currently serialized as camelCase and we don't actually need it anywhere
  details: MatchDetailsWithFallbackSchema,
})

export const MatchSchema = Schema.Struct({
  id: Schema.String,
  matchType: pipe(
    Schema.propertySignature(TransformedMatchTypeSchema),
    Schema.fromKey('match_type'),
  ),
  // Minimal to avoid recursing into the full BankTransactionSchema.
  bankTransaction: pipe(
    Schema.propertySignature(MinimalBankTransactionSchema),
    Schema.fromKey('bank_transaction'),
  ),
  details: MatchDetailsWithFallbackSchema,
})

export type Match = typeof MatchSchema.Type
