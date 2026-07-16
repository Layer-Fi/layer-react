import { pipe, Schema } from 'effect'

import { BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'
import { SingleCategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'
import { createTransformedEnumSchema } from '@schemas/utils'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

export enum CustomAccountSubtype {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum CustomAccountType {
  DEPOSITORY = 'DEPOSITORY',
  CREDIT = 'CREDIT',
}

// Backend `CustomAccountType` classification sent as `custom_account_type`; the
// form only distinguishes personal accounts from the business default.
export enum CustomAccountClassification {
  DEFAULT = 'DEFAULT',
  PERSONAL = 'PERSONAL',
}

export const CustomAccountSubtypeSchema = Schema.Enums(CustomAccountSubtype)
export const CustomAccountTypeSchema = Schema.Enums(CustomAccountType)
export const CustomAccountClassificationSchema = Schema.Enums(CustomAccountClassification)

// Each subtype belongs to exactly one type. This is the single source of truth
// for that mapping (the form and fixtures both rely on it).
export const getCustomAccountTypeFromSubtype = (
  subtype: CustomAccountSubtype,
): CustomAccountType => {
  switch (subtype) {
    case CustomAccountSubtype.CHECKING:
    case CustomAccountSubtype.SAVINGS:
      return CustomAccountType.DEPOSITORY
    case CustomAccountSubtype.CREDIT_CARD:
      return CustomAccountType.CREDIT
    default:
      unsafeAssertUnreachable({
        value: subtype,
        message: 'Unexpected custom account subtype',
      })
  }
}

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
  customAccountType: pipe(
    Schema.propertySignature(
      createTransformedEnumSchema(
        CustomAccountClassificationSchema,
        CustomAccountClassification,
        CustomAccountClassification.DEFAULT,
      ),
    ),
    Schema.fromKey('custom_account_type'),
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
  direction: BankTransactionDirectionSchema,
  date: Schema.String,
  description: Schema.String,
  referenceNumber: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('reference_number'),
  ),
})

export type CustomTransaction = typeof CustomTransactionSchema.Type
export type RawCustomTransaction = typeof CustomTransactionSchema.Encoded

export const RecordCustomTransactionSchema = Schema.Struct({
  amount: Schema.Number,
  direction: BankTransactionDirectionSchema,
  date: Schema.String,
  description: Schema.String,
  customerId: Schema.optional(Schema.UUID).pipe(Schema.fromKey('customer_id')),
  vendorId: Schema.optional(Schema.UUID).pipe(Schema.fromKey('vendor_id')),
  categorization: Schema.optional(SingleCategoryUpdateSchema),
})

export type RecordCustomTransaction = typeof RecordCustomTransactionSchema.Type

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
