import { Direction } from './bank_transactions'
import { Category } from './categories'

export interface LedgerAccounts {
  name: string
  accounts: Account[]
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

export interface AccountAlternate {
  type: 'Ledger_Account'
  id: string
  name: string
  stable_name: string | null
  normality: Direction
  pnl_category: string | null
}

export type NewAccount = {
  name: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  description: string
}
