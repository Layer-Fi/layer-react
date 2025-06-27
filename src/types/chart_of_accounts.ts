import { Direction } from './bank_transactions'
import { Category } from './categories'

export interface ChartOfAccounts {
  type: string
  accounts: Account[]
  entries?: unknown[]
}

export interface AccountEntry {
  account: Account
  amount?: number
  createdAt?: string
  direction: Direction
  entry_at?: string
  entry_id?: string
  id?: string
}

export interface Account {
  id: string
  number: number
  pnlCategory?: Category
  headerForPnlCategory?: Category
  name: string
  accountStableName?: string
  description?: string
  scheduleCLine?: string
  scheduleCLineDescription?: string
  sub_accounts?: Account[]
  hidePnl: boolean
  showInPnlIfEmpty: boolean
  normality: Direction
  balance: number
  selfOnlyBalance: number
  entries?: AccountEntry[]
}

export type ChartWithBalances = {
  accounts: LedgerAccountBalance[]
}

export type ApiAccountType = {
  value: string
  display_name: string
}

export type LedgerAccountBalance = {
  id: string
  name: string
  stable_name: string
  account_type: ApiAccountType
  account_subtype?: ApiAccountType
  normality: Direction
  balance: number
  sub_accounts: LedgerAccountBalance[]
}

export type AugmentedLedgerAccountBalance = LedgerAccountBalance & { isMatching?: true }

export type NewAccount = {
  name: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  account_type: string
  account_subtype?: string
}

export type EditAccount = {
  stable_name?: {
    type: 'StableName'
    stable_name: string
  }
  name: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  account_type: string
  account_subtype?: string
}

export type NewChildAccount = {
  name: string
  stable_name?: {
    type: 'StableName'
    stable_name: string
  }
}
