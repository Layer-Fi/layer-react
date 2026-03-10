import i18next from 'i18next'

import { Direction } from '@internal-types/general'
import { type BaseSelectOption } from '@internal-types/general'

export const LEDGER_ACCOUNT_TYPES: BaseSelectOption[] = [
  {
    value: 'ASSET',
    label: i18next.t('assets', 'Assets'),
  },
  {
    value: 'LIABILITY',
    label: i18next.t('liabilities', 'Liabilities'),
  },
  {
    value: 'EQUITY',
    label: i18next.t('equities', 'Equities'),
  },
  {
    value: 'REVENUE',
    label: i18next.t('revenue', 'Revenue'),
  },
  {
    value: 'EXPENSE',
    label: i18next.t('expenses', 'Expenses'),
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
    label: i18next.t('debit', 'Debit'),
  },
  {
    value: Direction.CREDIT,
    label: i18next.t('credit', 'Credit'),
  },
]

export const ASSET_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'BANK_ACCOUNTS',
    label: i18next.t('bankAccounts', 'Bank Accounts'),
  },
  {
    value: 'ACCOUNTS_RECEIVABLE',
    label: i18next.t('accountsReceivable', 'Accounts Receivable'),
  },
  {
    value: 'INVENTORY',
    label: i18next.t('inventory', 'Inventory'),
  },
  {
    value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT',
    label: i18next.t('paymentProcessorClearingAccounts', 'Payment Processor Clearing Accounts'),
  },
  {
    value: 'FIXED_ASSET',
    label: i18next.t('fixedAssets', 'Fixed Assets'),
  },
  {
    value: 'ACCUMULATED_DEPRECIATION',
    label: i18next.t('accumulatedDepreciation', 'Accumulated Depreciation'),
  },
  {
    value: 'CASH',
    label: i18next.t('cash', 'Cash'),
  },
  {
    value: 'UNDEPOSITED_FUNDS',
    label: i18next.t('undepositedFunds', 'Undeposited Funds'),
  },
  {
    value: 'CURRENT_ASSET',
    label: i18next.t('currentAssets', 'Current Assets'),
  },
  {
    value: 'NON_CURRENT_ASSET',
    label: i18next.t('noncurrentAssets', 'Non-Current Assets'),
  },
  {
    value: 'PREPAID_EXPENSES',
    label: i18next.t('prepaidExpenses', 'Prepaid Expenses'),
  },
  {
    value: 'DEVELOPMENT_COSTS',
    label: i18next.t('developmentCosts', 'Development Costs'),
  },
  {
    value: 'LOANS_RECEIVABLE',
    label: i18next.t('loansReceivable', 'Loans Receivable'),
  },
  {
    value: 'INTANGIBLE_ASSET',
    label: i18next.t('intangibleAssets', 'Intangible Assets'),
  },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'ACCOUNTS_PAYABLE',
    label: i18next.t('accountsPayable', 'Accounts Payable'),
  },
  {
    value: 'CREDIT_CARD',
    label: i18next.t('creditCards', 'Credit Cards'),
  },
  {
    value: 'INCOME_TAXES_PAYABLE',
    label: i18next.t('incomeTaxesPayable', 'Income Taxes Payable'),
  },
  {
    value: 'SALES_TAXES_PAYABLE',
    label: i18next.t('salesTaxesPayable', 'Sales Taxes Payable'),
  },
  {
    value: 'OTHER_TAXES_PAYABLE',
    label: i18next.t('otherTaxesPayable', 'Other Taxes Payable'),
  },
  {
    value: 'PAYROLL_TAXES_PAYABLE',
    label: i18next.t('payrollTaxesPayable', 'Payroll Taxes Payable'),
  },
  {
    value: 'UNEARNED_REVENUE',
    label: i18next.t('unearnedRevenue', 'Unearned Revenue'),
  },
  {
    value: 'PAYROLL_LIABILITY',
    label: i18next.t('payrollLiabilities', 'Payroll Liabilities'),
  },
  {
    value: 'PAYROLL_CLEARING',
    label: i18next.t('payrollClearing', 'Payroll Clearing'),
  },
  {
    value: 'LINE_OF_CREDIT',
    label: i18next.t('linesOfCredit', 'Lines of Credit'),
  },
  {
    value: 'TIPS',
    label: i18next.t('tips', 'Tips'),
  },
  {
    value: 'REFUND_LIABILITIES',
    label: i18next.t('refundLiabilities', 'Refund Liabilities'),
  },
  {
    value: 'UNDEPOSITED_OUTFLOWS',
    label: i18next.t('undepositedOutflows', 'Undeposited Outflows'),
  },
  {
    value: 'OUTGOING_PAYMENT_CLEARING_ACCOUNT',
    label: i18next.t('outgoingPaymentClearingAccounts', 'Outgoing Payment Clearing Accounts'),
  },
  {
    value: 'OTHER_CURRENT_LIABILITY',
    label: i18next.t('currentLiabilities', 'Current Liabilities'),
  },
  {
    value: 'LOANS_PAYABLE',
    label: i18next.t('loansPayable', 'Loans Payable'),
  },
  {
    value: 'NOTES_PAYABLE',
    label: i18next.t('notesPayable', 'Notes Payable'),
  },
  {
    value: 'SHAREHOLDER_LOAN',
    label: i18next.t('shareholderLoans', 'Shareholder Loans'),
  },
  {
    value: 'NON_CURRENT_LIABILITY',
    label: i18next.t('longTermLiabilities', 'Long Term Liabilities'),
  },
]

export const EQUITY_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'CONTRIBUTIONS',
    label: i18next.t('contributions', 'Contributions'),
  },
  {
    value: 'DISTRIBUTIONS',
    label: i18next.t('distributions', 'Distributions'),
  },
  {
    value: 'COMMON_STOCK',
    label: i18next.t('commonStock', 'Common Stock'),
  },
  {
    value: 'PREFERRED_STOCK',
    label: i18next.t('preferredStock', 'Preferred Stock'),
  },
  {
    value: 'ADDITIONAL_PAID_IN_CAPITAL',
    label: i18next.t('additionalPaidInCapital', 'Additional Paid In Capital'),
  },
  {
    value: 'RETAINED_EARNINGS',
    label: i18next.t('retainedEarnings', 'Retained Earnings'),
  },
  {
    value: 'ACCUMULATED_ADJUSTMENTS',
    label: i18next.t('accumulatedAdjustments', 'Accumulated Adjustments'),
  },
  {
    value: 'OPENING_BALANCE_EQUITY',
    label: i18next.t('openingBalanceEquity', 'Opening Balance Equity'),
  },
  {
    value: 'OTHER_EQUITY',
    label: i18next.t('otherEquity', 'Other Equity'),
  },
]

export const REVENUE_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'SALES',
    label: i18next.t('sales', 'Sales'),
  },
  {
    value: 'UNCATEGORIZED_REVENUE',
    label: i18next.t('uncategorizedRevenue', 'Uncategorized Revenue'),
  },
  {
    value: 'RETURNS_ALLOWANCES',
    label: i18next.t('returnsAllowances', 'Returns & Allowances'),
  },
  {
    value: 'DIVIDEND_INCOME',
    label: i18next.t('dividendIncome', 'Dividend Income'),
  },
  {
    value: 'INTEREST_INCOME',
    label: i18next.t('interestIncome', 'Interest Income'),
  },
  {
    value: 'OTHER_INCOME',
    label: i18next.t('otherIncome', 'Other Income'),
  },
]

export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES: BaseSelectOption[] = [
  {
    value: 'COGS',
    label: i18next.t('cogs', 'COGS'),
  },
  {
    value: 'OPERATING_EXPENSES',
    label: i18next.t('operatingExpenses', 'Operating Expenses'),
  },
  {
    value: 'PAYROLL',
    label: i18next.t('payroll', 'Payroll'),
  },
  {
    value: 'TAXES_LICENSES',
    label: i18next.t('taxesLicenses', 'Taxes & Licenses'),
  },
  {
    value: 'UNCATEGORIZED_EXPENSE',
    label: i18next.t('uncategorizedExpense', 'Uncategorized Expense'),
  },
  {
    value: 'CHARITABLE_CONTRIBUTIONS',
    label: i18next.t('charitableContributions', 'Charitable Contributions'),
  },
  {
    value: 'LOAN_EXPENSES',
    label: i18next.t('loanExpenses', 'Loan Expenses'),
  },
  {
    value: 'FINANCE_COSTS',
    label: i18next.t('financeCosts', 'Finance Costs'),
  },
  {
    value: 'INTEREST_EXPENSES',
    label: i18next.t('interestExpenses', 'Interest Expenses'),
  },
  {
    value: 'DEPRECIATION',
    label: i18next.t('depreciation', 'Depreciation'),
  },
  {
    value: 'AMORTIZATION',
    label: i18next.t('amortization', 'Amortization'),
  },
  {
    value: 'BAD_DEBT',
    label: i18next.t('badDebt', 'Bad Debt'),
  },
  {
    value: 'OTHER_EXPENSES',
    label: i18next.t('otherExpenses', 'Other Expenses'),
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
