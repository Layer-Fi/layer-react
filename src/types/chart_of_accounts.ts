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
