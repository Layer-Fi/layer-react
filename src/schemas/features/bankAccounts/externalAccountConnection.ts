import { pipe, Schema } from 'effect'

import { AccountInstitutionSchema } from '@schemas/common/accountInstitution'
import { createOpenEnumSchema } from '@schemas/common/utils'
import { AccountNotificationSchema } from '@schemas/features/bankAccounts/accountNotification'

export enum ExternalAccountUpdateType {
  Background = 'BACKGROUND',
  UserPresentRequired = 'USER_PRESENT_REQUIRED',
  Unknown = 'UNKNOWN',
}
const ExternalAccountUpdateTypeSchema = createOpenEnumSchema(ExternalAccountUpdateType)

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
  lastSyncedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('last_synced_at'),
  ),
  updateType: pipe(
    Schema.propertySignature(Schema.NullishOr(ExternalAccountUpdateTypeSchema)),
    Schema.fromKey('update_type'),
  ),
})
export type ExternalAccountConnection = typeof ExternalAccountConnectionSchema.Type
