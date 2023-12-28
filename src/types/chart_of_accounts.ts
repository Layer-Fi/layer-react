import { Direction } from './bank_transactions'
import { Category } from './categories'

export interface ChartOfAccounts {
  name: string
  accounts: Account[]
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
  subAccounts?: Account[]
  hidePnl: boolean
  showInPnlIfEmpty: boolean
  normality: Direction
  balance: number
  selfOnlyBalance: number
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
  parent_id: {
    type: 'AccountId'
    id: string
  }
  description: string
}
