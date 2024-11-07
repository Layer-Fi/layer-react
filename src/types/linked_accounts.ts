import type { PlaidInstitution } from 'react-plaid-link'
import type { EnumWithUnknownValues } from './utility/enumWithUnknownValues'

export type PublicToken = {
  public_token: string
  institution: PlaidInstitution | null
}

export type AccountSource = EnumWithUnknownValues<'PLAID' | 'STRIPE'>

const KNOWN_ACCOUNT_NOTIFICATION_TYPES = [
  'CONFIRM_RELEVANT',
  'CONFIRM_UNIQUE'
] as const
type KnownAccountNotificationType = typeof KNOWN_ACCOUNT_NOTIFICATION_TYPES[number]

const KNOWN_ACCOUNT_NOTIFICATION_SCOPES = ['USER'] as const
type KnownAccountNotificationScope = typeof KNOWN_ACCOUNT_NOTIFICATION_SCOPES[number]

type AccountNotificationType = EnumWithUnknownValues<KnownAccountNotificationType>
type AccountNotificationScope = EnumWithUnknownValues<KnownAccountNotificationScope>

type AccountNotification = {
  type: AccountNotificationType
  scope: AccountNotificationScope
}

export type LinkedAccount = {
  id: string
  external_account_external_id: string
  external_account_source: AccountSource
  external_account_name: string
  latest_balance_timestamp: {
    external_account_external_id: string
    external_account_source: AccountSource
    balance: number
    at: string
    created_at: string
  }
  current_ledger_balance: number
  institution: {
    name: string
    logo: string | null
  }
  notifications?: ReadonlyArray<AccountNotification>
  mask?: string
  connection_id?: string
  connection_external_id?: string
  connection_needs_repair_as_of: string | null
  requires_user_confirmation_as_of: string | null
  is_syncing: boolean
}

export type LinkedAccounts = {
  type: string
  external_accounts: Array<LinkedAccount>
}
