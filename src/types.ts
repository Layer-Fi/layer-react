import type { EnumWithUnknownValues } from './types/utility/enumWithUnknownValues'

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
  SuggestedMatch,
  BankTransactionMatch,
} from './types/bank_transactions'
export {
  ApiMatchDetails,
  ManualJournalEntryMatchDetails,
  RefundPaymentMatchDetails,
  VendorRefundPaymentMatchDetails,
  // InvoicePaymentMatchDetails,
  PayoutMatchDetails,
  VendorPayoutMatchDetails,
  BillPaymentMatchDetails,
  PayrollPaymentMatchDetails,
  TransferMatchDetails,
  SuggestedMatchWithTransaction,
  SuggestedMatchesWithTransactions,
  isTransferMatch,
} from './types/match_details'
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
  NewChildAccount,
} from './types/chart_of_accounts'
export {
  LedgerAccountLineItems as LedgerAccounts,
  LedgerAccountLineItem,
  LedgerAccountsAccount,
  LedgerAccountsEntry,
} from './types/ledger_accounts'
export { SortDirection } from './types/general'
export { Business } from './types/business'
export { Bill } from './types/bills'
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

// Only Date and string (ISO8601 formatted) make sense here
export type DateRange<T = Date> = {
  startDate: T
  endDate: T
}

type StrictReportingBasis = 'CASH' | 'CASH_COLLECTED' | 'ACCRUAL'
export type ReportingBasis = EnumWithUnknownValues<StrictReportingBasis>

export type MoneyFormat = 'CENTS' | 'DOLLAR_STRING'
