import type { PlaidInstitution } from 'react-plaid-link'

import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'

export type PublicToken = {
  public_token: string
  institution: PlaidInstitution | null
}

export type AccountSource = EnumWithUnknownValues<'PLAID' | 'STRIPE'>

const _KNOWN_ACCOUNT_NOTIFICATION_TYPES = [
  'CONFIRM_RELEVANT',
  'CONFIRM_UNIQUE',
  'OPENING_BALANCE_MISSING',
] as const
type KnownAccountNotificationType =
  (typeof _KNOWN_ACCOUNT_NOTIFICATION_TYPES)[number]

const _KNOWN_ACCOUNT_NOTIFICATION_SCOPES = ['USER'] as const
type KnownAccountNotificationScope =
  (typeof _KNOWN_ACCOUNT_NOTIFICATION_SCOPES)[number]

type AccountNotificationType =
  EnumWithUnknownValues<KnownAccountNotificationType>
type AccountNotificationScope =
  EnumWithUnknownValues<KnownAccountNotificationScope>

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
  } | null
  notifications?: ReadonlyArray<AccountNotification>
  mask?: string
  connection_id?: string
  connection_external_id?: string
  connection_needs_repair_as_of: string | null
  is_syncing: boolean
  user_created: boolean
  reconnect_with_new_credentials: boolean
}

export type LinkedAccounts = {
  type: string
  external_accounts: Array<LinkedAccount>
}

export type BalanceTimestamp = {
  external_account_external_id: string
  external_account_source: AccountSource
  balance: number
  at: string
  created_at: string
}

export type OpeningBalance = {
  ledger_account_id: string
  ledger_account_name: string
  balance: number
  effective_at: string
  created_at: string
  updated_at: string
}

export type ExternalAccountConnection = {
  id: string
  external_account_external_id: string | null
  external_account_source: AccountSource
  external_account_name: string
  latest_balance_timestamp: BalanceTimestamp | null
  mask: string | null
  institution: {
    name: string
    logo: string | null
  } | null
  notifications?: ReadonlyArray<AccountNotification>
  connection_needs_repair_as_of: string | null
  reconnect_with_new_credentials: boolean
  requires_user_confirmation_as_of: string | null
  connection_id: string | null
  connection_external_id: string | null
  user_created: boolean
  is_syncing: boolean
  ledger_account_id: string | null
  archived_at: string | null
  account_type: AccountType
  account_subtype: AccountSubtype
  show_transactions_on_or_after: string | null
  show_transactions_on_or_before: string | null
}

export type FinancialAccountInstitution = {
  id: string
  name: string
  logo: string | null
}

export type BankAccount = {
  id: string
  account_name: string | null
  ledger_account_id: string
  notes: string | null
  institution: FinancialAccountInstitution | null
  account_type: AccountType
  account_subtype: AccountSubtype
  notify_when_disconnected: boolean
  is_disconnected: boolean
  archived_at: string | null
  external_accounts: ExternalAccountConnection[]
  opening_balance: OpeningBalance | null
  latest_balance_timestamp: BalanceTimestamp | null
  current_ledger_balance: number
  uncategorized_transaction_sum: number
  balance_difference: number | null
  mask: string | null
  notifications: ReadonlyArray<AccountNotification>
}

export type AccountType = 'DEPOSITORY' | 'CREDIT' | 'LOAN'

export type AccountSubtype =
  | '_401A'
  | '_401K'
  | '_403B'
  | '_457B'
  | '_529'
  | 'BROKERAGE'
  | 'CASH_ISA'
  | 'CRYPTO_EXCHANGE'
  | 'EDUCATION_SAVINGS_ACCOUNT'
  | 'EBT'
  | 'FIXED_ANNUITY'
  | 'GIC'
  | 'HEALTH_REIMBURSEMENT_ARRANGEMENT'
  | 'HSA'
  | 'ISA'
  | 'IRA'
  | 'LIF'
  | 'LIFE_INSURANCE'
  | 'LIRA'
  | 'LRIF'
  | 'LRSP'
  | 'NON_CUSTODIAL_WALLET'
  | 'NON_TAXABLE_BROKERAGE_ACCOUNT'
  | 'OTHER'
  | 'OTHER_INSURANCE'
  | 'OTHER_ANNUITY'
  | 'PRIF'
  | 'RDSP'
  | 'RESP'
  | 'RLIF'
  | 'RRIF'
  | 'PENSION'
  | 'PROFIT_SHARING_PLAN'
  | 'RETIREMENT'
  | 'ROTH'
  | 'ROTH_401K'
  | 'RRSP'
  | 'SEP_IRA'
  | 'SIMPLE_IRA'
  | 'SIPP'
  | 'STOCK_PLAN'
  | 'THRIFT_SAVINGS_PLAN'
  | 'TFSA'
  | 'TRUST'
  | 'UGMA'
  | 'UTMA'
  | 'VARIABLE_ANNUITY'
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'CD'
  | 'CHECKING'
  | 'SAVINGS'
  | 'MONEY_MARKET'
  | 'PREPAID'
  | 'AUTO'
  | 'BUSINESS'
  | 'COMMERCIAL'
  | 'CONSTRUCTION'
  | 'CONSUMER'
  | 'HOME_EQUITY'
  | 'LOAN'
  | 'MORTGAGE'
  | 'OVERDRAFT'
  | 'LINE_OF_CREDIT'
  | 'STUDENT'
  | 'CASH_MANAGEMENT'
  | 'KEOGH'
  | 'MUTUAL_FUND'
  | 'RECURRING'
  | 'REWARDS'
  | 'SAFE_DEPOSIT'
  | 'SARSEP'
  | 'PAYROLL'
  | 'NULL'
  | 'ENUM_UNKNOWN'
