import { pipe, Schema } from 'effect'

export enum BankTransactionDirection {
  MoneyIn = 'MONEY_IN',
  MoneyOut = 'MONEY_OUT',
}

/*
 * The API historically serialized `BankTransactionDirection` as CREDIT/DEBIT.
 * Accept both encodings until it fully switches to MONEY_IN/MONEY_OUT.
 */
export const BankTransactionDirectionSchema = Schema.transform(
  Schema.Literal('MONEY_IN', 'CREDIT', 'MONEY_OUT', 'DEBIT'),
  Schema.typeSchema(Schema.Enums(BankTransactionDirection)),
  {
    decode: (input) => {
      switch (input) {
        case 'MONEY_IN':
        case 'CREDIT':
          return BankTransactionDirection.MoneyIn
        case 'MONEY_OUT':
        case 'DEBIT':
          return BankTransactionDirection.MoneyOut
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
