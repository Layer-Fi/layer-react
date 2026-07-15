import { pipe, Schema } from 'effect'

export enum BankTransactionDirection {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}

/*
 * The API is migrating `BankTransactionDirection` from CREDIT/DEBIT to
 * MONEY_IN/MONEY_OUT. Accept both encodings; CREDIT/DEBIT stay canonical
 * until the backend serializes the new values.
 */
export const BankTransactionDirectionSchema = Schema.transform(
  Schema.Literal('CREDIT', 'MONEY_IN', 'DEBIT', 'MONEY_OUT'),
  Schema.typeSchema(Schema.Enums(BankTransactionDirection)),
  {
    decode: (input) => {
      switch (input) {
        case 'CREDIT':
        case 'MONEY_IN':
          return BankTransactionDirection.Credit
        case 'DEBIT':
        case 'MONEY_OUT':
          return BankTransactionDirection.Debit
      }
    },
    encode: input => input,
  },
)

export const MinimalBankTransactionSchema = Schema.Struct({
  id: Schema.String,
  date: Schema.Date,
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

export type BankTransactionCounterparty = typeof BankTransactionCounterpartySchema.Type
