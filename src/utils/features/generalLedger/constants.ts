import { Direction } from '@internal-types/shared/money'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { translationKey } from '@utils/shared/i18n/translationKey'

export type OptionConfig = { value: string, i18nKey: string, defaultValue: string }

export const LEDGER_ACCOUNT_TYPES_CONFIG: OptionConfig[] = [
  { value: 'ASSET', ...translationKey('common:label.assets', 'Assets') },
  { value: 'LIABILITY', ...translationKey('common:label.liabilities', 'Liabilities') },
  { value: 'EQUITY', ...translationKey('common:label.equities', 'Equities') },
  { value: 'REVENUE', ...translationKey('common:label.revenue', 'Revenue') },
  { value: 'EXPENSE', ...translationKey('common:label.expenses', 'Expenses') },
]

export const NORMALITY_CONFIG: { value: Direction, i18nKey: string, defaultValue: string }[] = [
  { value: Direction.DEBIT, ...translationKey('common:label.debit', 'Debit') },
  { value: Direction.CREDIT, ...translationKey('common:label.credit', 'Credit') },
]

export const ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'BANK_ACCOUNTS', ...translationKey('generalLedger:constants.label.bank_accounts', 'Bank Accounts') },
  { value: 'ACCOUNTS_RECEIVABLE', ...translationKey('generalLedger:constants.label.accounts_receivable', 'Accounts Receivable') },
  { value: 'INVENTORY', ...translationKey('generalLedger:constants.label.inventory', 'Inventory') },
  { value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT', ...translationKey('generalLedger:constants.label.payment_processor_clearing_accounts', 'Payment Processor Clearing Accounts') },
  { value: 'FIXED_ASSET', ...translationKey('generalLedger:constants.label.fixed_assets', 'Fixed Assets') },
  { value: 'ACCUMULATED_DEPRECIATION', ...translationKey('generalLedger:constants.label.accumulated_depreciation', 'Accumulated Depreciation') },
  { value: 'CASH', ...translationKey('generalLedger:constants.label.cash', 'Cash') },
  { value: 'UNDEPOSITED_FUNDS', ...translationKey('generalLedger:constants.label.undeposited_funds', 'Undeposited Funds') },
  { value: 'CURRENT_ASSET', ...translationKey('generalLedger:constants.label.current_assets', 'Current Assets') },
  { value: 'NON_CURRENT_ASSET', ...translationKey('generalLedger:constants.label.non_current_assets', 'Non-Current Assets') },
  { value: 'PREPAID_EXPENSES', ...translationKey('generalLedger:constants.label.prepaid_expenses', 'Prepaid Expenses') },
  { value: 'DEVELOPMENT_COSTS', ...translationKey('generalLedger:constants.label.development_costs', 'Development Costs') },
  { value: 'LOANS_RECEIVABLE', ...translationKey('generalLedger:constants.label.loans_receivable', 'Loans Receivable') },
  { value: 'INTANGIBLE_ASSET', ...translationKey('generalLedger:constants.label.intangible_assets', 'Intangible Assets') },
]

export const LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'ACCOUNTS_PAYABLE', ...translationKey('generalLedger:constants.label.accounts_payable', 'Accounts Payable') },
  { value: 'CREDIT_CARD', ...translationKey('generalLedger:constants.label.credit_cards', 'Credit Cards') },
  { value: 'INCOME_TAXES_PAYABLE', ...translationKey('generalLedger:constants.label.income_taxes_payable', 'Income Taxes Payable') },
  { value: 'SALES_TAXES_PAYABLE', ...translationKey('generalLedger:constants.label.sales_taxes_payable', 'Sales Taxes Payable') },
  { value: 'OTHER_TAXES_PAYABLE', ...translationKey('generalLedger:constants.label.other_taxes_payable', 'Other Taxes Payable') },
  { value: 'PAYROLL_TAXES_PAYABLE', ...translationKey('generalLedger:constants.label.payroll_taxes_payable', 'Payroll Taxes Payable') },
  { value: 'UNEARNED_REVENUE', ...translationKey('generalLedger:constants.label.unearned_revenue', 'Unearned Revenue') },
  { value: 'PAYROLL_LIABILITY', ...translationKey('generalLedger:constants.label.payroll_liabilities', 'Payroll Liabilities') },
  { value: 'PAYROLL_CLEARING', ...translationKey('generalLedger:constants.label.payroll_clearing', 'Payroll Clearing') },
  { value: 'LINE_OF_CREDIT', ...translationKey('generalLedger:constants.label.lines_of_credit', 'Lines of Credit') },
  { value: 'TIPS', ...translationKey('generalLedger:constants.label.tips', 'Tips') },
  { value: 'REFUND_LIABILITIES', ...translationKey('generalLedger:constants.label.refund_liabilities', 'Refund Liabilities') },
  { value: 'UNDEPOSITED_OUTFLOWS', ...translationKey('generalLedger:constants.label.undeposited_outflows', 'Undeposited Outflows') },
  { value: 'OUTGOING_PAYMENT_CLEARING_ACCOUNT', ...translationKey('generalLedger:constants.label.outgoing_payment_clearing_accounts', 'Outgoing Payment Clearing Accounts') },
  { value: 'OTHER_CURRENT_LIABILITY', ...translationKey('generalLedger:constants.label.current_liabilities', 'Current Liabilities') },
  { value: 'LOANS_PAYABLE', ...translationKey('generalLedger:constants.label.loans_payable', 'Loans Payable') },
  { value: 'NOTES_PAYABLE', ...translationKey('generalLedger:constants.label.notes_payable', 'Notes Payable') },
  { value: 'SHAREHOLDER_LOAN', ...translationKey('generalLedger:constants.label.shareholder_loans', 'Shareholder Loans') },
  { value: 'NON_CURRENT_LIABILITY', ...translationKey('generalLedger:constants.label.long_term_liabilities', 'Long Term Liabilities') },
]

export const EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'CONTRIBUTIONS', ...translationKey('generalLedger:constants.label.contributions', 'Contributions') },
  { value: 'DISTRIBUTIONS', ...translationKey('generalLedger:constants.label.distributions', 'Distributions') },
  { value: 'COMMON_STOCK', ...translationKey('generalLedger:constants.label.common_stock', 'Common Stock') },
  { value: 'PREFERRED_STOCK', ...translationKey('generalLedger:constants.label.preferred_stock', 'Preferred Stock') },
  { value: 'ADDITIONAL_PAID_IN_CAPITAL', ...translationKey('generalLedger:constants.label.additional_paid_in_capital', 'Additional Paid In Capital') },
  { value: 'RETAINED_EARNINGS', ...translationKey('generalLedger:constants.label.retained_earnings', 'Retained Earnings') },
  { value: 'ACCUMULATED_ADJUSTMENTS', ...translationKey('generalLedger:constants.label.accumulated_adjustments', 'Accumulated Adjustments') },
  { value: 'OPENING_BALANCE_EQUITY', ...translationKey('generalLedger:constants.label.opening_balance_equity', 'Opening Balance Equity') },
  { value: 'OTHER_EQUITY', ...translationKey('generalLedger:constants.label.other_equity', 'Other Equity') },
]

export const REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'SALES', ...translationKey('generalLedger:constants.label.sales', 'Sales') },
  { value: 'UNCATEGORIZED_REVENUE', ...translationKey('generalLedger:constants.label.uncategorized_revenue', 'Uncategorized Revenue') },
  { value: 'RETURNS_ALLOWANCES', ...translationKey('generalLedger:constants.label.returns_allowances', 'Returns & Allowances') },
  { value: 'DIVIDEND_INCOME', ...translationKey('generalLedger:constants.label.dividend_income', 'Dividend Income') },
  { value: 'INTEREST_INCOME', ...translationKey('generalLedger:constants.label.interest_income', 'Interest Income') },
  { value: 'OTHER_INCOME', ...translationKey('generalLedger:constants.label.other_income', 'Other Income') },
]

export const EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG: OptionConfig[] = [
  { value: 'COGS', ...translationKey('generalLedger:constants.label.cogs', 'COGS') },
  { value: 'OPERATING_EXPENSES', ...translationKey('generalLedger:constants.label.operating_expenses', 'Operating Expenses') },
  { value: 'PAYROLL', ...translationKey('generalLedger:constants.label.payroll', 'Payroll') },
  { value: 'TAXES_LICENSES', ...translationKey('generalLedger:constants.label.taxes_licenses', 'Taxes & Licenses') },
  { value: 'UNCATEGORIZED_EXPENSE', ...translationKey('generalLedger:constants.label.uncategorized_expense', 'Uncategorized Expense') },
  { value: 'CHARITABLE_CONTRIBUTIONS', ...translationKey('generalLedger:constants.label.charitable_contributions', 'Charitable Contributions') },
  { value: 'LOAN_EXPENSES', ...translationKey('generalLedger:constants.label.loan_expenses', 'Loan Expenses') },
  { value: 'FINANCE_COSTS', ...translationKey('generalLedger:constants.label.finance_costs', 'Finance Costs') },
  { value: 'INTEREST_EXPENSES', ...translationKey('generalLedger:constants.label.interest_expenses', 'Interest Expenses') },
  { value: 'DEPRECIATION', ...translationKey('generalLedger:constants.label.depreciation', 'Depreciation') },
  { value: 'AMORTIZATION', ...translationKey('generalLedger:constants.label.amortization', 'Amortization') },
  { value: 'BAD_DEBT', ...translationKey('generalLedger:constants.label.bad_debt', 'Bad Debt') },
  { value: 'OTHER_EXPENSES', ...translationKey('generalLedger:constants.label.other_expenses', 'Other Expenses') },
]

export const SUBTYPES_CONFIG_BY_TYPE: Record<LedgerAccountType, OptionConfig[]> = {
  [LedgerAccountType.Asset]: ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  [LedgerAccountType.Liability]: LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  [LedgerAccountType.Equity]: EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  [LedgerAccountType.Revenue]: REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  [LedgerAccountType.Expense]: EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
}
