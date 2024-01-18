import { Categorization, CategorizationStatus, Category } from './categories'

export enum Direction {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

// This isn't my favorite but BankTransaction contains much
// more than we're using right now.
export interface BankTransaction extends Record<string, unknown> {
  type: 'Bank_Transaction'
  account_name?: string
  business_id: string
  recently_categorized?: boolean
  id: string
  date: string
  source: string
  source_transaction_id: string
  source_account_id: string
  imported_at: string
  description: string | null
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
  categorization_status: CategorizationStatus
  categorization_flow: Categorization
  categorization_method: string
  error?: string
  processing?: boolean
}
