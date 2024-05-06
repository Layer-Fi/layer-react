import { Direction } from '../../types'
import { BaseSelectOption } from '../../types/general'

export const LEDGER_ACCOUNT_TYPES: BaseSelectOption[] = [
  {
    value: 'ASSET',
    label: 'Assets',
  },
  {
    value: 'LIABILITY',
    label: 'Liabilities',
  },
  {
    value: 'EQUITY',
    label: 'Equities',
  },
  {
    value: 'REVENUE',
    label: 'Revenue',
  },
  {
    value: 'EXPENSE',
    label: 'Expenses',
  },
]

export const DEFAULT_ACCOUNT_TYPE_DIRECTION: Record<string, Direction> = {
  ASSET: Direction.DEBIT,
  LIABILITY: Direction.CREDIT,
  EQUITY: Direction.CREDIT,
  REVENUE: Direction.CREDIT,
  EXPENSE: Direction.DEBIT,
}

export const NORMALITY_OPTIONS: BaseSelectOption[] = [
  {
    value: Direction.DEBIT,
    label: 'Debit',
  },
  {
    value: Direction.CREDIT,
    label: 'Credit',
  },
]

export const ASSET_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'BANK_ACCOUNTS',
    label: 'Bank Accounts',
  },
  {
    value: 'ACCOUNTS_RECEIVABLE',
    label: 'Accounts Receivable',
  },
  {
    value: 'INVENTORY',
    label: 'Inventory',
  },
  {
    value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT',
    label: 'Payment Processor Clearing Accounts',
  },
  {
    value: 'FIXED_ASSET',
    label: 'Fixed Assets',
  },
  {
    value: 'CASH',
    label: 'Cash',
  },
  {
    value: 'UNDEPOSITED_FUNDS',
    label: 'Undeposited Funds',
  },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'LIABILITY',
    label: 'Liabilities',
  },
  {
    value: 'ACCOUNTS_PAYABLE',
    label: 'Accounts Payable',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Credit Cards',
  },
  {
    value: 'SHAREHOLDER_LOAN',
    label: 'Shareholder Loans',
  },
  {
    value: 'PAYROLL_LIABILITY',
    label: 'Payroll Liabilities',
  },
  {
    value: 'SALES_TAXES_PAYABLE',
    label: 'Sales Taxes Payable',
  },
  {
    value: 'LINE_OF_CREDIT',
    label: 'Lines of Credit',
  },
  {
    value: 'NOTES_PAYABLE',
    label: 'Notes Payable',
  },
  {
    value: 'TIPS',
    label: 'Tips',
  },
  {
    value: 'UNEARNED_REVENUE',
    label: 'Unearned Revenue',
  },
  {
    value: 'UNDEPOSITED_OUTFLOWS',
    label: 'Undeposited Outflows',
  },
]
export const EQUITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'CONTRIBUTIONS',
    label: 'Contributions',
  },
  {
    value: 'DISTRIBUTIONS',
    label: 'Distributions',
  },
  {
    value: 'COMMON_STOCK',
    label: 'Common Stock',
  },
  {
    value: 'ADDITIONAL_PAID_IN_CAPITAL',
    label: 'Additional Paid In Capital',
  },
  {
    value: 'RETAINED_EARNINGS',
    label: 'Retained Earnings',
  },
  {
    value: 'ACCUMULATED_ADJUSTMENTS',
    label: 'Accumulated Adjustments',
  },
  {
    value: 'OPENING_BALANCE_EQUITY',
    label: 'Opening Balance Equity',
  },
]

export const REVENUE_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'SALES',
    label: 'Sales',
  },
  {
    value: 'UNCATEGORIZED_REVENUE',
    label: 'Uncategorized Revenue',
  },
  {
    value: 'RETURNS_ALLOWANCES',
    label: 'Returns & Allowances',
  },
]

export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'COGS',
    label: 'COGS',
  },
  {
    value: 'OPERATING_EXPENSES',
    label: 'Operating Expenses',
  },
  {
    value: 'PAYROLL',
    label: 'Payroll',
  },
  {
    value: 'TAXES_LICENSES',
    label: 'Taxes & Licenses',
  },
  {
    value: 'BAD_DEBT',
    label: 'Bad Debt',
  },
  {
    value: 'CHARITABLE_CONTRIBUTIONS',
    label: 'Charitable Contributions',
  },
]

export const LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  ...ASSET_LEDGER_ACCOUNT_SUBTYPES,
  ...LIABILITY_LEDGER_ACCOUNT_SUBTYPES,
  ...EQUITY_LEDGER_ACCOUNT_SUBTYPES,
  ...REVENUE_LEDGER_ACCOUNT_SUBTYPES,
  ...EXPENSE_LEDGER_ACCOUNT_SUBTYPES,
]

export const LEDGER_ACCOUNT_SUBTYPES_FOR_TYPE: Record<
  string,
  BaseSelectOption[]
> = {
  ASSET: ASSET_LEDGER_ACCOUNT_SUBTYPES,
  LIABILITY: LIABILITY_LEDGER_ACCOUNT_SUBTYPES,
  EQUITY: EQUITY_LEDGER_ACCOUNT_SUBTYPES,
  REVENUE: REVENUE_LEDGER_ACCOUNT_SUBTYPES,
  EXPENSE: EXPENSE_LEDGER_ACCOUNT_SUBTYPES,
}
