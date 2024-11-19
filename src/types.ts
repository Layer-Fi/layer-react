import { DatePickerMode } from './components/DatePicker/ModeSelector/DatePickerModeSelector'

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
export { StatementOfCashFlow } from './types/statement_of_cash_flow'
export {
  Direction,
  BankTransaction,
  DisplayState,
} from './types/bank_transactions'
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
} from './types/chart_of_accounts'
export {
  LedgerAccountLineItems as LedgerAccounts,
  LedgerAccountLineItem,
  LedgerAccountsAccount,
  LedgerAccountsEntry,
} from './types/ledger_accounts'
export { SortDirection } from './types/general'
export { Business } from './types/business'

export interface FormError {
  field: string
  message: string
}

export interface FormErrorWithId extends FormError {
  id: number
}

export {
  JournalEntry,
  JournalEntryLine,
  JournalEntryLineItem,
} from './types/journal'

export type DateMode =
  | 'DAY'
  | 'DAY_RANGE'
  | 'MONTH'
  | 'MONTH_RANGE'
  | 'QAURTER'
  | 'YEAR'
  | 'YEAR_TO_DATE'

export type DateState = {
  startDate: Date
  endDate: Date
  period: DatePeriod
  mode: DatePickerMode // @TODO - make something more generic and unify with DatePickerMode
  supportedModes?: DatePickerMode[]
}

// Only Date and string (ISO8601 formatted) make sense here
export type DateRange<T = Date> = {
  startDate: T
  endDate: T
}

export type DatePeriod =
  | 'DAY'
  | 'MONTH'
  | 'QUARTER'
  | 'YEAR'
  | 'YEAR_TO_DATE'
  | 'CUSTOM'

export type ReportingBasis = 'CASH' | 'ACCRUAL'

export type MoneyFormat = 'CENTS' | 'DOLLAR_STRING'
