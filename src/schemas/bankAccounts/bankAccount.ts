import { pipe, Schema } from 'effect'

import { AccountNotificationSchema } from '@schemas/bankAccounts/accountNotification'
import { ExternalAccountConnectionSchema } from '@schemas/bankAccounts/externalAccountConnection'
import { AccountInstitutionSchema } from '@schemas/common/accountInstitution'

export const BalanceTimestampSchema = Schema.Struct({
  balance: Schema.Number,
})
export type BalanceTimestamp = typeof BalanceTimestampSchema.Type

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
