export { OAuthResponse } from './types/authentication'
export {
  LayerContextValues,
  LayerContextActionName,
  LayerContextAction,
  LayerContextHelpers,
} from './types/layer_context'
export { Metadata } from './types/api'
export { ProfitAndLoss } from './types/profit_and_loss'
export { LineItem } from './types/line_item'
export { BalanceSheet } from './types/balance_sheet'
export { Direction, BankTransaction } from './types/bank_transactions'
export {
  CategorizationStatus,
  Category,
  CategorizationType,
  AutoCategorization,
  SuggestedCategorization,
  SingleCategoryUpdate,
  SplitCategoryUpdate,
  CategoryUpdate,
} from './types/categories'
export {
  ChartOfAccounts,
  Account,
  NewAccount,
  EditAccount,
  LedgerAccountLine,
  LedgerAccountEntry,
} from './types/chart_of_accounts'
export { SortDirection } from './types/general'

// Only Date and string (ISO8601 formatted) make sense here
export type DateRange<T = Date> = {
  startDate: T
  endDate: T
}

export type ReportingBasis = 'CASH' | 'ACCRUAL'
