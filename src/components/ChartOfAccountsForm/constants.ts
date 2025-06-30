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
    value: 'ACCUMULATED_DEPRECIATION',
    label: 'Accumulated Depreciation',
  },
  {
    value: 'CASH',
    label: 'Cash',
  },
  {
    value: 'UNDEPOSITED_FUNDS',
    label: 'Undeposited Funds',
  },
  {
    value: 'CURRENT_ASSET',
    label: 'Current Assets',
  },
  {
    value: 'NON_CURRENT_ASSET',
    label: 'Non-Current Assets',
  },
  {
    value: 'PREPAID_EXPENSES',
    label: 'Prepaid Expenses',
  },
  {
    value: 'DEVELOPMENT_COSTS',
    label: 'Development Costs',
  },
  {
    value: 'LOANS_RECEIVABLE',
    label: 'Loans Receivable',
  },
  {
    value: 'INTANGIBLE_ASSET',
    label: 'Intangible Assets',
  },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'ACCOUNTS_PAYABLE',
    label: 'Accounts Payable',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Credit Cards',
  },
  {
    value: 'INCOME_TAXES_PAYABLE',
    label: 'Income Taxes Payable',
  },
  {
    value: 'SALES_TAXES_PAYABLE',
    label: 'Sales Taxes Payable',
  },
  {
    value: 'OTHER_TAXES_PAYABLE',
    label: 'Other Taxes Payable',
  },
  {
    value: 'PAYROLL_TAXES_PAYABLE',
    label: 'Payroll Taxes Payable',
  },
  {
    value: 'UNEARNED_REVENUE',
    label: 'Unearned Revenue',
  },
  {
    value: 'PAYROLL_LIABILITY',
    label: 'Payroll Liabilities',
  },
  {
    value: 'PAYROLL_CLEARING',
    label: 'Payroll Clearing',
  },
  {
    value: 'LINE_OF_CREDIT',
    label: 'Lines of Credit',
  },
  {
    value: 'TIPS',
    label: 'Tips',
  },
  {
    value: 'REFUND_LIABILITIES',
    label: 'Refund Liabilities',
  },
  {
    value: 'UNDEPOSITED_OUTFLOWS',
    label: 'Undeposited Outflows',
  },
  {
    value: 'OUTGOING_PAYMENT_CLEARING_ACCOUNT',
    label: 'Outgoing Payment Clearing Accounts',
  },
  {
    value: 'OTHER_CURRENT_LIABILITY',
    label: 'Current Liabilities',
  },
  {
    value: 'LOANS_PAYABLE',
    label: 'Loans Payable',
  },
  {
    value: 'NOTES_PAYABLE',
    label: 'Notes Payable',
  },
  {
    value: 'SHAREHOLDER_LOAN',
    label: 'Shareholder Loans',
  },
  {
    value: 'NON_CURRENT_LIABILITY',
    label: 'Long Term Liabilities',
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
    value: 'PREFERRED_STOCK',
    label: 'Preferred Stock',
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
  {
    value: 'OTHER_EQUITY',
    label: 'Other Equity',
  }
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
  {
    value: 'DIVIDEND_INCOME',
    label: 'Dividend Income',
  },
  {
    value: 'INTEREST_INCOME',
    label: 'Interest Income',
  },
  {
    value: 'OTHER_INCOME',
    label: 'Other Income',
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
    value: 'UNCATEGORIZED_EXPENSE',
    label: 'Uncategorized Expense',
  },
  {
    value: 'CHARITABLE_CONTRIBUTIONS',
    label: 'Charitable Contributions',
  },
  {
    value: 'LOAN_EXPENSES',
    label: 'Loan Expenses',
  },
  {
    value: 'FINANCE_COSTS',
    label: 'Finance Costs',
  },
  {
    value: 'INTEREST_EXPENSES',
    label: 'Interest Expenses',
  },
  {
    value: 'DEPRECIATION',
    label: 'Depreciation',
  },
  {
    value: 'AMORTIZATION',
    label: 'Amortization',
  },
  {
    value: 'BAD_DEBT',
    label: 'Bad Debt',
  },
  {
    value: 'OTHER_EXPENSES',
    label: 'Other Expenses',
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