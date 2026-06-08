import { pipe, Schema } from 'effect'

import { AccountInstitutionSchema } from '@schemas/common/accountInstitution'

export const AccountNotificationSchema = Schema.Struct({
  type: Schema.String,
})
export type AccountNotification = typeof AccountNotificationSchema.Type

export const BalanceTimestampSchema = Schema.Struct({
  balance: Schema.Number,
})
export type BalanceTimestamp = typeof BalanceTimestampSchema.Type

export const ExternalAccountConnectionSchema = Schema.Struct({
  id: Schema.UUID,
  externalAccountSource: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_account_source'),
  ),
  externalAccountName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_account_name'),
  ),
  mask: Schema.NullishOr(Schema.String),
  institution: Schema.NullishOr(AccountInstitutionSchema),
  notifications: Schema.Array(AccountNotificationSchema),
  connectionNeedsRepairAsOf: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('connection_needs_repair_as_of'),
  ),
  reconnectWithNewCredentials: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('reconnect_with_new_credentials'),
  ),
  connectionExternalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('connection_external_id'),
  ),
  userCreated: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('user_created'),
  ),
  isSyncing: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_syncing'),
  ),
})
export type ExternalAccountConnection = typeof ExternalAccountConnectionSchema.Type

export const BankAccountSchema = Schema.Struct({
  id: Schema.UUID,
  accountName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('account_name'),
  ),
  institution: Schema.NullishOr(AccountInstitutionSchema),
  notifyWhenDisconnected: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('notify_when_disconnected'),
  ),
  isDisconnected: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_disconnected'),
  ),
  externalAccounts: pipe(
    Schema.propertySignature(Schema.Array(ExternalAccountConnectionSchema)),
    Schema.fromKey('external_accounts'),
  ),
  latestBalanceTimestamp: pipe(
    Schema.propertySignature(Schema.NullishOr(BalanceTimestampSchema)),
    Schema.fromKey('latest_balance_timestamp'),
  ),
  currentLedgerBalance: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('current_ledger_balance'),
  ),
  mask: Schema.NullishOr(Schema.String),
  notifications: Schema.Array(AccountNotificationSchema),
})
export type BankAccount = typeof BankAccountSchema.Type
