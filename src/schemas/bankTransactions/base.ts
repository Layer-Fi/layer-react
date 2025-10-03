import { Schema, pipe } from 'effect'

export enum BankTransactionDirection {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}
export const BankTransactionDirectionSchema = Schema.Enums(BankTransactionDirection)

export const MinimalBankTransactionSchema = Schema.Struct({
  id: Schema.String,
  date: Schema.String, // Keep as ISO8601 since we get that from the backend
  direction: BankTransactionDirectionSchema,
  amount: Schema.Number,
  counterpartyName: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('counterparty_name'),
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
})

export type MinimalBankTransaction = typeof MinimalBankTransactionSchema.Type

export const BankTransactionCounterpartySchema = Schema.Struct({
  id: Schema.String,
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  website: Schema.optional(Schema.NullOr(Schema.String)),
  logo: Schema.optional(Schema.NullOr(Schema.String)),
  mccs: Schema.Array(Schema.String),
})
