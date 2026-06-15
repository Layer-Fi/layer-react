import { pipe, Schema } from 'effect'

import { Direction } from '@internal-types/general'

export enum CustomAccountSubtype {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum CustomAccountType {
  DEPOSITORY = 'DEPOSITORY',
  CREDIT = 'CREDIT',
}

export const CustomAccountSubtypeSchema = Schema.Enums(CustomAccountSubtype)
export const CustomAccountTypeSchema = Schema.Enums(CustomAccountType)

export const CustomAccountSchema = Schema.Struct({
  id: Schema.UUID,
  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  mask: Schema.NullishOr(Schema.String),
  accountName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('account_name'),
  ),
  institutionName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('institution_name'),
  ),
  accountType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('account_subtype'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('created_at'),
  ),
  updatedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('updated_at'),
  ),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('archived_at'),
  ),
  ledgerAccountId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('ledger_account_id'),
  ),
  userCreated: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('user_created'),
  ),
})

export type CustomAccount = typeof CustomAccountSchema.Type
export type RawCustomAccount = typeof CustomAccountSchema.Encoded

export const CustomTransactionSchema = Schema.Struct({
  externalId: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  date: Schema.String,
  description: Schema.String,
  referenceNumber: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('reference_number'),
  ),
})

export type CustomTransaction = typeof CustomTransactionSchema.Type
export type RawCustomTransaction = typeof CustomTransactionSchema.Encoded

export const CustomAccountTransactionRowSchema = Schema.Struct({
  date: Schema.String,
  description: Schema.String,
  amount: Schema.Number,
  externalId: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),
  referenceNumber: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('reference_number'),
  ),
})

export type CustomAccountTransactionRow = typeof CustomAccountTransactionRowSchema.Type
