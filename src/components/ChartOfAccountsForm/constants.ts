import { Direction } from '@internal-types/general'
import { translationKey } from '@utils/i18n/translationKey'

export type OptionConfig = { value: string, i18nKey: string, defaultValue: string }

export const LEDGER_ACCOUNT_TYPES_CONFIG: OptionConfig[] = [
  { value: 'ASSET', ...translationKey('assets', 'Assets') },
  { value: 'LIABILITY', ...translationKey('liabilities', 'Liabilities') },
  { value: 'EQUITY', ...translationKey('equities', 'Equities') },
  { value: 'REVENUE', ...translationKey('revenue', 'Revenue') },
  { value: 'EXPENSE', ...translationKey('expenses', 'Expenses') },
]

export const DEFAULT_ACCOUNT_TYPE_DIRECTION: Record<string, Direction> = {
  ASSET: Direction.DEBIT,
  LIABILITY: Direction.CREDIT,
  EQUITY: Direction.CREDIT,
  REVENUE: Direction.CREDIT,
  EXPENSE: Direction.DEBIT,
}

export const NORMALITY_CONFIG: { value: Direction, i18nKey: string, defaultValue: string }[] = [
  { value: Direction.DEBIT, ...translationKey('debit', 'Debit') },
  { value: Direction.CREDIT, ...translationKey('credit', 'Credit') },
]

export const ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'BANK_ACCOUNTS', ...translationKey('bankAccounts', 'Bank Accounts') },
  { value: 'ACCOUNTS_RECEIVABLE', ...translationKey('accountsReceivable', 'Accounts Receivable') },
  { value: 'INVENTORY', ...translationKey('inventory', 'Inventory') },
  { value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT', ...translationKey('paymentProcessorClearingAccounts', 'Payment Processor Clearing Accounts') },
  { value: 'FIXED_ASSET', ...translationKey('fixedAssets', 'Fixed Assets') },
  { value: 'ACCUMULATED_DEPRECIATION', ...translationKey('accumulatedDepreciation', 'Accumulated Depreciation') },
  { value: 'CASH', ...translationKey('cash', 'Cash') },
  { value: 'UNDEPOSITED_FUNDS', ...translationKey('undepositedFunds', 'Undeposited Funds') },
  { value: 'CURRENT_ASSET', ...translationKey('currentAssets', 'Current Assets') },
  { value: 'NON_CURRENT_ASSET', ...translationKey('noncurrentAssets', 'Non-Current Assets') },
  { value: 'PREPAID_EXPENSES', ...translationKey('prepaidExpenses', 'Prepaid Expenses') },
  { value: 'DEVELOPMENT_COSTS', ...translationKey('developmentCosts', 'Development Costs') },
  { value: 'LOANS_RECEIVABLE', ...translationKey('loansReceivable', 'Loans Receivable') },
  { value: 'INTANGIBLE_ASSET', ...translationKey('intangibleAssets', 'Intangible Assets') },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'ACCOUNTS_PAYABLE', ...translationKey('accountsPayable', 'Accounts Payable') },
  { value: 'CREDIT_CARD', ...translationKey('creditCards', 'Credit Cards') },
  { value: 'INCOME_TAXES_PAYABLE', ...translationKey('incomeTaxesPayable', 'Income Taxes Payable') },
  { value: 'SALES_TAXES_PAYABLE', ...translationKey('salesTaxesPayable', 'Sales Taxes Payable') },
  { value: 'OTHER_TAXES_PAYABLE', ...translationKey('otherTaxesPayable', 'Other Taxes Payable') },
  { value: 'PAYROLL_TAXES_PAYABLE', ...translationKey('payrollTaxesPayable', 'Payroll Taxes Payable') },
  { value: 'UNEARNED_REVENUE', ...translationKey('unearnedRevenue', 'Unearned Revenue') },
  { value: 'PAYROLL_LIABILITY', ...translationKey('payrollLiabilities', 'Payroll Liabilities') },
  { value: 'PAYROLL_CLEARING', ...translationKey('payrollClearing', 'Payroll Clearing') },
  { value: 'LINE_OF_CREDIT', ...translationKey('linesOfCredit', 'Lines of Credit') },
  { value: 'TIPS', ...translationKey('tips', 'Tips') },
  { value: 'REFUND_LIABILITIES', ...translationKey('refundLiabilities', 'Refund Liabilities') },
  { value: 'UNDEPOSITED_OUTFLOWS', ...translationKey('undepositedOutflows', 'Undeposited Outflows') },
  { value: 'OUTGOING_PAYMENT_CLEARING_ACCOUNT', ...translationKey('outgoingPaymentClearingAccounts', 'Outgoing Payment Clearing Accounts') },
  { value: 'OTHER_CURRENT_LIABILITY', ...translationKey('currentLiabilities', 'Current Liabilities') },
  { value: 'LOANS_PAYABLE', ...translationKey('loansPayable', 'Loans Payable') },
  { value: 'NOTES_PAYABLE', ...translationKey('notesPayable', 'Notes Payable') },
  { value: 'SHAREHOLDER_LOAN', ...translationKey('shareholderLoans', 'Shareholder Loans') },
  { value: 'NON_CURRENT_LIABILITY', ...translationKey('longTermLiabilities', 'Long Term Liabilities') },
]

export const EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'CONTRIBUTIONS', ...translationKey('contributions', 'Contributions') },
  { value: 'DISTRIBUTIONS', ...translationKey('distributions', 'Distributions') },
  { value: 'COMMON_STOCK', ...translationKey('commonStock', 'Common Stock') },
  { value: 'PREFERRED_STOCK', ...translationKey('preferredStock', 'Preferred Stock') },
  { value: 'ADDITIONAL_PAID_IN_CAPITAL', ...translationKey('additionalPaidInCapital', 'Additional Paid In Capital') },
  { value: 'RETAINED_EARNINGS', ...translationKey('retainedEarnings', 'Retained Earnings') },
  { value: 'ACCUMULATED_ADJUSTMENTS', ...translationKey('accumulatedAdjustments', 'Accumulated Adjustments') },
  { value: 'OPENING_BALANCE_EQUITY', ...translationKey('openingBalanceEquity', 'Opening Balance Equity') },
  { value: 'OTHER_EQUITY', ...translationKey('otherEquity', 'Other Equity') },
]

export const REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'SALES', ...translationKey('sales', 'Sales') },
  { value: 'UNCATEGORIZED_REVENUE', ...translationKey('uncategorizedRevenue', 'Uncategorized Revenue') },
  { value: 'RETURNS_ALLOWANCES', ...translationKey('returnsAllowances', 'Returns & Allowances') },
  { value: 'DIVIDEND_INCOME', ...translationKey('dividendIncome', 'Dividend Income') },
  { value: 'INTEREST_INCOME', ...translationKey('interestIncome', 'Interest Income') },
  { value: 'OTHER_INCOME', ...translationKey('otherIncome', 'Other Income') },
]

export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'COGS', ...translationKey('cogs', 'COGS') },
  { value: 'OPERATING_EXPENSES', ...translationKey('operatingExpenses', 'Operating Expenses') },
  { value: 'PAYROLL', ...translationKey('payroll', 'Payroll') },
  { value: 'TAXES_LICENSES', ...translationKey('taxesLicenses', 'Taxes & Licenses') },
  { value: 'UNCATEGORIZED_EXPENSE', ...translationKey('uncategorizedExpense', 'Uncategorized Expense') },
  { value: 'CHARITABLE_CONTRIBUTIONS', ...translationKey('charitableContributions', 'Charitable Contributions') },
  { value: 'LOAN_EXPENSES', ...translationKey('loanExpenses', 'Loan Expenses') },
  { value: 'FINANCE_COSTS', ...translationKey('financeCosts', 'Finance Costs') },
  { value: 'INTEREST_EXPENSES', ...translationKey('interestExpenses', 'Interest Expenses') },
  { value: 'DEPRECIATION', ...translationKey('depreciation', 'Depreciation') },
  { value: 'AMORTIZATION', ...translationKey('amortization', 'Amortization') },
  { value: 'BAD_DEBT', ...translationKey('badDebt', 'Bad Debt') },
  { value: 'OTHER_EXPENSES', ...translationKey('otherExpenses', 'Other Expenses') },
]
