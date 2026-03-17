import { Direction } from '@internal-types/general'
import { translationKey } from '@utils/i18n/translationKey'

export type OptionConfig = { value: string, i18nKey: string, defaultValue: string }

export const LEDGER_ACCOUNT_TYPES_CONFIG: OptionConfig[] = [
  { value: 'ASSET', ...translationKey('common:label.assets', 'Assets') },
  { value: 'LIABILITY', ...translationKey('common:label.liabilities', 'Liabilities') },
  { value: 'EQUITY', ...translationKey('common:label.equities', 'Equities') },
  { value: 'REVENUE', ...translationKey('common:label.revenue', 'Revenue') },
  { value: 'EXPENSE', ...translationKey('common:label.expenses', 'Expenses') },
]

export const DEFAULT_ACCOUNT_TYPE_DIRECTION: Record<string, Direction> = {
  ASSET: Direction.DEBIT,
  LIABILITY: Direction.CREDIT,
  EQUITY: Direction.CREDIT,
  REVENUE: Direction.CREDIT,
  EXPENSE: Direction.DEBIT,
}

export const NORMALITY_CONFIG: { value: Direction, i18nKey: string, defaultValue: string }[] = [
  { value: Direction.DEBIT, ...translationKey('common:label.debit', 'Debit') },
  { value: Direction.CREDIT, ...translationKey('common:label.credit', 'Credit') },
]

export const ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'BANK_ACCOUNTS', ...translationKey('chartOfAccounts:label.bank_accounts', 'Bank Accounts') },
  { value: 'ACCOUNTS_RECEIVABLE', ...translationKey('chartOfAccounts:label.accounts_receivable', 'Accounts Receivable') },
  { value: 'INVENTORY', ...translationKey('chartOfAccounts:label.inventory', 'Inventory') },
  { value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT', ...translationKey('chartOfAccounts:label.payment_processor_clearing_accounts', 'Payment Processor Clearing Accounts') },
  { value: 'FIXED_ASSET', ...translationKey('chartOfAccounts:label.fixed_assets', 'Fixed Assets') },
  { value: 'ACCUMULATED_DEPRECIATION', ...translationKey('chartOfAccounts:label.accumulated_depreciation', 'Accumulated Depreciation') },
  { value: 'CASH', ...translationKey('chartOfAccounts:label.cash', 'Cash') },
  { value: 'UNDEPOSITED_FUNDS', ...translationKey('chartOfAccounts:label.undeposited_funds', 'Undeposited Funds') },
  { value: 'CURRENT_ASSET', ...translationKey('chartOfAccounts:label.current_assets', 'Current Assets') },
  { value: 'NON_CURRENT_ASSET', ...translationKey('chartOfAccounts:label.non_current_assets', 'Non-Current Assets') },
  { value: 'PREPAID_EXPENSES', ...translationKey('chartOfAccounts:label.prepaid_expenses', 'Prepaid Expenses') },
  { value: 'DEVELOPMENT_COSTS', ...translationKey('chartOfAccounts:label.development_costs', 'Development Costs') },
  { value: 'LOANS_RECEIVABLE', ...translationKey('chartOfAccounts:label.loans_receivable', 'Loans Receivable') },
  { value: 'INTANGIBLE_ASSET', ...translationKey('chartOfAccounts:label.intangible_assets', 'Intangible Assets') },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'ACCOUNTS_PAYABLE', ...translationKey('chartOfAccounts:label.accounts_payable', 'Accounts Payable') },
  { value: 'CREDIT_CARD', ...translationKey('chartOfAccounts:label.credit_cards', 'Credit Cards') },
  { value: 'INCOME_TAXES_PAYABLE', ...translationKey('chartOfAccounts:label.income_taxes_payable', 'Income Taxes Payable') },
  { value: 'SALES_TAXES_PAYABLE', ...translationKey('chartOfAccounts:label.sales_taxes_payable', 'Sales Taxes Payable') },
  { value: 'OTHER_TAXES_PAYABLE', ...translationKey('chartOfAccounts:label.other_taxes_payable', 'Other Taxes Payable') },
  { value: 'PAYROLL_TAXES_PAYABLE', ...translationKey('chartOfAccounts:label.payroll_taxes_payable', 'Payroll Taxes Payable') },
  { value: 'UNEARNED_REVENUE', ...translationKey('chartOfAccounts:label.unearned_revenue', 'Unearned Revenue') },
  { value: 'PAYROLL_LIABILITY', ...translationKey('chartOfAccounts:label.payroll_liabilities', 'Payroll Liabilities') },
  { value: 'PAYROLL_CLEARING', ...translationKey('chartOfAccounts:label.payroll_clearing', 'Payroll Clearing') },
  { value: 'LINE_OF_CREDIT', ...translationKey('chartOfAccounts:label.lines_of_credit', 'Lines of Credit') },
  { value: 'TIPS', ...translationKey('chartOfAccounts:label.tips', 'Tips') },
  { value: 'REFUND_LIABILITIES', ...translationKey('chartOfAccounts:label.refund_liabilities', 'Refund Liabilities') },
  { value: 'UNDEPOSITED_OUTFLOWS', ...translationKey('chartOfAccounts:label.undeposited_outflows', 'Undeposited Outflows') },
  { value: 'OUTGOING_PAYMENT_CLEARING_ACCOUNT', ...translationKey('chartOfAccounts:label.outgoing_payment_clearing_accounts', 'Outgoing Payment Clearing Accounts') },
  { value: 'OTHER_CURRENT_LIABILITY', ...translationKey('chartOfAccounts:label.current_liabilities', 'Current Liabilities') },
  { value: 'LOANS_PAYABLE', ...translationKey('chartOfAccounts:label.loans_payable', 'Loans Payable') },
  { value: 'NOTES_PAYABLE', ...translationKey('chartOfAccounts:label.notes_payable', 'Notes Payable') },
  { value: 'SHAREHOLDER_LOAN', ...translationKey('chartOfAccounts:label.shareholder_loans', 'Shareholder Loans') },
  { value: 'NON_CURRENT_LIABILITY', ...translationKey('chartOfAccounts:label.long_term_liabilities', 'Long Term Liabilities') },
]

export const EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'CONTRIBUTIONS', ...translationKey('chartOfAccounts:label.contributions', 'Contributions') },
  { value: 'DISTRIBUTIONS', ...translationKey('chartOfAccounts:label.distributions', 'Distributions') },
  { value: 'COMMON_STOCK', ...translationKey('chartOfAccounts:label.common_stock', 'Common Stock') },
  { value: 'PREFERRED_STOCK', ...translationKey('chartOfAccounts:label.preferred_stock', 'Preferred Stock') },
  { value: 'ADDITIONAL_PAID_IN_CAPITAL', ...translationKey('chartOfAccounts:label.additional_paid_in_capital', 'Additional Paid In Capital') },
  { value: 'RETAINED_EARNINGS', ...translationKey('chartOfAccounts:label.retained_earnings', 'Retained Earnings') },
  { value: 'ACCUMULATED_ADJUSTMENTS', ...translationKey('chartOfAccounts:label.accumulated_adjustments', 'Accumulated Adjustments') },
  { value: 'OPENING_BALANCE_EQUITY', ...translationKey('chartOfAccounts:label.opening_balance_equity', 'Opening Balance Equity') },
  { value: 'OTHER_EQUITY', ...translationKey('chartOfAccounts:label.other_equity', 'Other Equity') },
]

export const REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'SALES', ...translationKey('chartOfAccounts:label.sales', 'Sales') },
  { value: 'UNCATEGORIZED_REVENUE', ...translationKey('chartOfAccounts:label.uncategorized_revenue', 'Uncategorized Revenue') },
  { value: 'RETURNS_ALLOWANCES', ...translationKey('chartOfAccounts:label.returns_allowances', 'Returns & Allowances') },
  { value: 'DIVIDEND_INCOME', ...translationKey('chartOfAccounts:label.dividend_income', 'Dividend Income') },
  { value: 'INTEREST_INCOME', ...translationKey('chartOfAccounts:label.interest_income', 'Interest Income') },
  { value: 'OTHER_INCOME', ...translationKey('chartOfAccounts:label.other_income', 'Other Income') },
]

export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'COGS', ...translationKey('chartOfAccounts:label.cogs', 'COGS') },
  { value: 'OPERATING_EXPENSES', ...translationKey('chartOfAccounts:label.operating_expenses', 'Operating Expenses') },
  { value: 'PAYROLL', ...translationKey('chartOfAccounts:label.payroll', 'Payroll') },
  { value: 'TAXES_LICENSES', ...translationKey('chartOfAccounts:label.taxes_licenses', 'Taxes & Licenses') },
  { value: 'UNCATEGORIZED_EXPENSE', ...translationKey('chartOfAccounts:label.uncategorized_expense', 'Uncategorized Expense') },
  { value: 'CHARITABLE_CONTRIBUTIONS', ...translationKey('chartOfAccounts:label.charitable_contributions', 'Charitable Contributions') },
  { value: 'LOAN_EXPENSES', ...translationKey('chartOfAccounts:label.loan_expenses', 'Loan Expenses') },
  { value: 'FINANCE_COSTS', ...translationKey('chartOfAccounts:label.finance_costs', 'Finance Costs') },
  { value: 'INTEREST_EXPENSES', ...translationKey('chartOfAccounts:label.interest_expenses', 'Interest Expenses') },
  { value: 'DEPRECIATION', ...translationKey('chartOfAccounts:label.depreciation', 'Depreciation') },
  { value: 'AMORTIZATION', ...translationKey('chartOfAccounts:label.amortization', 'Amortization') },
  { value: 'BAD_DEBT', ...translationKey('chartOfAccounts:label.bad_debt', 'Bad Debt') },
  { value: 'OTHER_EXPENSES', ...translationKey('chartOfAccounts:label.other_expenses', 'Other Expenses') },
]
