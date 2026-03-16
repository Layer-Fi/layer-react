import { Direction } from '@internal-types/general'
import { translationKey } from '@utils/i18n/translationKey'

export type OptionConfig = { value: string, i18nKey: string, defaultValue: string }

export const LEDGER_ACCOUNT_TYPES_CONFIG: OptionConfig[] = [
  { value: 'ASSET', ...translationKey('common.assets', 'Assets') },
  { value: 'LIABILITY', ...translationKey('common.liabilities', 'Liabilities') },
  { value: 'EQUITY', ...translationKey('common.equities', 'Equities') },
  { value: 'REVENUE', ...translationKey('common.revenue', 'Revenue') },
  { value: 'EXPENSE', ...translationKey('common.expenses', 'Expenses') },
]

export const DEFAULT_ACCOUNT_TYPE_DIRECTION: Record<string, Direction> = {
  ASSET: Direction.DEBIT,
  LIABILITY: Direction.CREDIT,
  EQUITY: Direction.CREDIT,
  REVENUE: Direction.CREDIT,
  EXPENSE: Direction.DEBIT,
}

export const NORMALITY_CONFIG: { value: Direction, i18nKey: string, defaultValue: string }[] = [
  { value: Direction.DEBIT, ...translationKey('common.debit', 'Debit') },
  { value: Direction.CREDIT, ...translationKey('common.credit', 'Credit') },
]

export const ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'BANK_ACCOUNTS', ...translationKey('chartOfAccounts.bankAccounts', 'Bank Accounts') },
  { value: 'ACCOUNTS_RECEIVABLE', ...translationKey('chartOfAccounts.accountsReceivable', 'Accounts Receivable') },
  { value: 'INVENTORY', ...translationKey('chartOfAccounts.inventory', 'Inventory') },
  { value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT', ...translationKey('chartOfAccounts.paymentProcessorClearingAccounts', 'Payment Processor Clearing Accounts') },
  { value: 'FIXED_ASSET', ...translationKey('chartOfAccounts.fixedAssets', 'Fixed Assets') },
  { value: 'ACCUMULATED_DEPRECIATION', ...translationKey('chartOfAccounts.accumulatedDepreciation', 'Accumulated Depreciation') },
  { value: 'CASH', ...translationKey('chartOfAccounts.cash', 'Cash') },
  { value: 'UNDEPOSITED_FUNDS', ...translationKey('chartOfAccounts.undepositedFunds', 'Undeposited Funds') },
  { value: 'CURRENT_ASSET', ...translationKey('chartOfAccounts.currentAssets', 'Current Assets') },
  { value: 'NON_CURRENT_ASSET', ...translationKey('chartOfAccounts.noncurrentAssets', 'Non-Current Assets') },
  { value: 'PREPAID_EXPENSES', ...translationKey('chartOfAccounts.prepaidExpenses', 'Prepaid Expenses') },
  { value: 'DEVELOPMENT_COSTS', ...translationKey('chartOfAccounts.developmentCosts', 'Development Costs') },
  { value: 'LOANS_RECEIVABLE', ...translationKey('chartOfAccounts.loansReceivable', 'Loans Receivable') },
  { value: 'INTANGIBLE_ASSET', ...translationKey('chartOfAccounts.intangibleAssets', 'Intangible Assets') },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'ACCOUNTS_PAYABLE', ...translationKey('chartOfAccounts.accountsPayable', 'Accounts Payable') },
  { value: 'CREDIT_CARD', ...translationKey('chartOfAccounts.creditCards', 'Credit Cards') },
  { value: 'INCOME_TAXES_PAYABLE', ...translationKey('chartOfAccounts.incomeTaxesPayable', 'Income Taxes Payable') },
  { value: 'SALES_TAXES_PAYABLE', ...translationKey('chartOfAccounts.salesTaxesPayable', 'Sales Taxes Payable') },
  { value: 'OTHER_TAXES_PAYABLE', ...translationKey('chartOfAccounts.otherTaxesPayable', 'Other Taxes Payable') },
  { value: 'PAYROLL_TAXES_PAYABLE', ...translationKey('chartOfAccounts.payrollTaxesPayable', 'Payroll Taxes Payable') },
  { value: 'UNEARNED_REVENUE', ...translationKey('chartOfAccounts.unearnedRevenue', 'Unearned Revenue') },
  { value: 'PAYROLL_LIABILITY', ...translationKey('chartOfAccounts.payrollLiabilities', 'Payroll Liabilities') },
  { value: 'PAYROLL_CLEARING', ...translationKey('chartOfAccounts.payrollClearing', 'Payroll Clearing') },
  { value: 'LINE_OF_CREDIT', ...translationKey('chartOfAccounts.linesOfCredit', 'Lines of Credit') },
  { value: 'TIPS', ...translationKey('chartOfAccounts.tips', 'Tips') },
  { value: 'REFUND_LIABILITIES', ...translationKey('chartOfAccounts.refundLiabilities', 'Refund Liabilities') },
  { value: 'UNDEPOSITED_OUTFLOWS', ...translationKey('chartOfAccounts.undepositedOutflows', 'Undeposited Outflows') },
  { value: 'OUTGOING_PAYMENT_CLEARING_ACCOUNT', ...translationKey('chartOfAccounts.outgoingPaymentClearingAccounts', 'Outgoing Payment Clearing Accounts') },
  { value: 'OTHER_CURRENT_LIABILITY', ...translationKey('chartOfAccounts.currentLiabilities', 'Current Liabilities') },
  { value: 'LOANS_PAYABLE', ...translationKey('chartOfAccounts.loansPayable', 'Loans Payable') },
  { value: 'NOTES_PAYABLE', ...translationKey('chartOfAccounts.notesPayable', 'Notes Payable') },
  { value: 'SHAREHOLDER_LOAN', ...translationKey('chartOfAccounts.shareholderLoans', 'Shareholder Loans') },
  { value: 'NON_CURRENT_LIABILITY', ...translationKey('chartOfAccounts.longTermLiabilities', 'Long Term Liabilities') },
]

export const EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'CONTRIBUTIONS', ...translationKey('chartOfAccounts.contributions', 'Contributions') },
  { value: 'DISTRIBUTIONS', ...translationKey('chartOfAccounts.distributions', 'Distributions') },
  { value: 'COMMON_STOCK', ...translationKey('chartOfAccounts.commonStock', 'Common Stock') },
  { value: 'PREFERRED_STOCK', ...translationKey('chartOfAccounts.preferredStock', 'Preferred Stock') },
  { value: 'ADDITIONAL_PAID_IN_CAPITAL', ...translationKey('chartOfAccounts.additionalPaidInCapital', 'Additional Paid In Capital') },
  { value: 'RETAINED_EARNINGS', ...translationKey('chartOfAccounts.retainedEarnings', 'Retained Earnings') },
  { value: 'ACCUMULATED_ADJUSTMENTS', ...translationKey('chartOfAccounts.accumulatedAdjustments', 'Accumulated Adjustments') },
  { value: 'OPENING_BALANCE_EQUITY', ...translationKey('chartOfAccounts.openingBalanceEquity', 'Opening Balance Equity') },
  { value: 'OTHER_EQUITY', ...translationKey('chartOfAccounts.otherEquity', 'Other Equity') },
]

export const REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'SALES', ...translationKey('chartOfAccounts.sales', 'Sales') },
  { value: 'UNCATEGORIZED_REVENUE', ...translationKey('chartOfAccounts.uncategorizedRevenue', 'Uncategorized Revenue') },
  { value: 'RETURNS_ALLOWANCES', ...translationKey('chartOfAccounts.returnsAllowances', 'Returns & Allowances') },
  { value: 'DIVIDEND_INCOME', ...translationKey('chartOfAccounts.dividendIncome', 'Dividend Income') },
  { value: 'INTEREST_INCOME', ...translationKey('chartOfAccounts.interestIncome', 'Interest Income') },
  { value: 'OTHER_INCOME', ...translationKey('chartOfAccounts.otherIncome', 'Other Income') },
]

export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'COGS', ...translationKey('chartOfAccounts.cogs', 'COGS') },
  { value: 'OPERATING_EXPENSES', ...translationKey('chartOfAccounts.operatingExpenses', 'Operating Expenses') },
  { value: 'PAYROLL', ...translationKey('chartOfAccounts.payroll', 'Payroll') },
  { value: 'TAXES_LICENSES', ...translationKey('chartOfAccounts.taxesLicenses', 'Taxes & Licenses') },
  { value: 'UNCATEGORIZED_EXPENSE', ...translationKey('chartOfAccounts.uncategorizedExpense', 'Uncategorized Expense') },
  { value: 'CHARITABLE_CONTRIBUTIONS', ...translationKey('chartOfAccounts.charitableContributions', 'Charitable Contributions') },
  { value: 'LOAN_EXPENSES', ...translationKey('chartOfAccounts.loanExpenses', 'Loan Expenses') },
  { value: 'FINANCE_COSTS', ...translationKey('chartOfAccounts.financeCosts', 'Finance Costs') },
  { value: 'INTEREST_EXPENSES', ...translationKey('chartOfAccounts.interestExpenses', 'Interest Expenses') },
  { value: 'DEPRECIATION', ...translationKey('chartOfAccounts.depreciation', 'Depreciation') },
  { value: 'AMORTIZATION', ...translationKey('chartOfAccounts.amortization', 'Amortization') },
  { value: 'BAD_DEBT', ...translationKey('chartOfAccounts.badDebt', 'Bad Debt') },
  { value: 'OTHER_EXPENSES', ...translationKey('chartOfAccounts.otherExpenses', 'Other Expenses') },
]
