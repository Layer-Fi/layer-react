import { SingleChartAccountSchema } from '@schemas/generalLedger/chartOfAccounts'
import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccountType'
import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerEntryDirection'

const BaseChartAccountSchema = SingleChartAccountSchema.omit('accountId', 'accountNumber')

export type BaseChartAccount = typeof BaseChartAccountSchema.Type

export type BaseChartAccountNode = BaseChartAccount & {
  subAccounts: readonly BaseChartAccountNode[]
}

export const ACCOUNT_TYPE_DISPLAY_NAME: Record<LedgerAccountType, string> = {
  [LedgerAccountType.Asset]: 'Assets',
  [LedgerAccountType.Liability]: 'Liabilities',
  [LedgerAccountType.Equity]: 'Equities',
  [LedgerAccountType.Revenue]: 'Revenue',
  [LedgerAccountType.Expense]: 'Expenses',
}

type Subtype = BaseChartAccount['accountSubtype']

type AccountArgs = {
  name: string
  stableName: string
  accountType: LedgerAccountType
  accountSubtype: Subtype
  normality: LedgerEntryDirection
  subAccounts?: readonly BaseChartAccountNode[]
}

const makeAccount = (
  { name, stableName, accountType, accountSubtype, normality, subAccounts = [] }: AccountArgs,
): BaseChartAccountNode => ({
  ...BaseChartAccountSchema.make({
    name,
    stableName,
    accountType: { value: accountType, displayName: ACCOUNT_TYPE_DISPLAY_NAME[accountType] },
    accountSubtype,
    normality,
  }),
  subAccounts,
})

const { Debit, Credit } = LedgerEntryDirection
const { Asset, Liability, Equity, Revenue, Expense } = LedgerAccountType

// Exactly the RequiredTemplateAccount entries of the backend's generic chart
// (BASE_CHART_OF_ACCOUNTS plus the modules genericCoa() adds), with its display
// names, subtypes, and nesting. Optional template accounts are otherwise absent, except
// PROFESSIONAL_SERVICES and INTEREST_EXPENSE, which Schedule C maps dedicated lines to.
export const BASE_CHART_OF_ACCOUNTS: readonly BaseChartAccountNode[] = [
  makeAccount({
    name: 'Assets',
    stableName: 'ASSETS',
    accountType: Asset,
    accountSubtype: { value: 'CURRENT_ASSET', displayName: 'Current Assets' },
    normality: Debit,
    subAccounts: [
      makeAccount({ name: 'Cash', stableName: 'CASH', accountType: Asset, accountSubtype: { value: 'CASH', displayName: 'Cash' }, normality: Debit }),
      makeAccount({ name: 'Bank Accounts', stableName: 'BANK_ACCOUNTS', accountType: Asset, accountSubtype: { value: 'BANK_ACCOUNTS', displayName: 'Bank Accounts' }, normality: Debit }),
      makeAccount({ name: 'Accounts Receivable (A/R)', stableName: 'ACCOUNTS_RECEIVABLE', accountType: Asset, accountSubtype: { value: 'ACCOUNTS_RECEIVABLE', displayName: 'Accounts Receivable' }, normality: Debit }),
      makeAccount({ name: 'Inventory', stableName: 'INVENTORY', accountType: Asset, accountSubtype: { value: 'INVENTORY', displayName: 'Inventory' }, normality: Debit }),
      makeAccount({
        name: 'Fixed Assets',
        stableName: 'FIXED_ASSETS',
        accountType: Asset,
        accountSubtype: { value: 'FIXED_ASSET', displayName: 'Fixed Assets' },
        normality: Debit,
        subAccounts: [
          makeAccount({ name: 'Accumulated Depreciation', stableName: 'ACCUMULATED_DEPRECIATION', accountType: Asset, accountSubtype: { value: 'ACCUMULATED_DEPRECIATION', displayName: 'Accumulated Depreciation' }, normality: Credit }),
        ],
      }),
      makeAccount({ name: 'Undeposited Funds', stableName: 'UNDEPOSITED_FUNDS', accountType: Asset, accountSubtype: { value: 'UNDEPOSITED_FUNDS', displayName: 'Undeposited Funds' }, normality: Debit }),
      makeAccount({ name: 'Payment Processor Clearing Accounts', stableName: 'PAYMENT_PROCESSOR_CLEARING', accountType: Asset, accountSubtype: { value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT', displayName: 'Payment Clearing Accounts' }, normality: Debit }),
      makeAccount({ name: 'Prepaid Expenses', stableName: 'PREPAID_EXPENSES', accountType: Asset, accountSubtype: { value: 'PREPAID_EXPENSES', displayName: 'Prepaid Expenses' }, normality: Debit }),
      makeAccount({ name: 'Development Costs', stableName: 'DEVELOPMENT_COSTS', accountType: Asset, accountSubtype: { value: 'DEVELOPMENT_COSTS', displayName: 'Development Costs' }, normality: Debit }),
    ],
  }),
  makeAccount({
    name: 'Liabilities',
    stableName: 'LIABILITIES',
    accountType: Liability,
    accountSubtype: { value: 'OTHER_CURRENT_LIABILITY', displayName: 'Current Liabilities' },
    normality: Credit,
    subAccounts: [
      makeAccount({ name: 'Accounts Payable (A/P)', stableName: 'ACCOUNTS_PAYABLE', accountType: Liability, accountSubtype: { value: 'ACCOUNTS_PAYABLE', displayName: 'Accounts Payable' }, normality: Credit }),
      makeAccount({ name: 'Refund Liabilities', stableName: 'REFUND_LIABILITIES', accountType: Liability, accountSubtype: { value: 'REFUND_LIABILITIES', displayName: 'Refund Liabilities' }, normality: Credit }),
      makeAccount({ name: 'Credit Cards', stableName: 'CREDIT_CARDS', accountType: Liability, accountSubtype: { value: 'CREDIT_CARD', displayName: 'Credit Cards' }, normality: Credit }),
      makeAccount({ name: 'Shareholder Loans', stableName: 'SHAREHOLDER_LOANS', accountType: Liability, accountSubtype: { value: 'SHAREHOLDER_LOAN', displayName: 'Shareholder Loans' }, normality: Credit }),
      makeAccount({ name: 'Payroll Liabilities', stableName: 'PAYROLL_LIABILITIES', accountType: Liability, accountSubtype: { value: 'PAYROLL_LIABILITY', displayName: 'Payroll Liabilities' }, normality: Credit }),
      makeAccount({ name: 'Sales Taxes Payable', stableName: 'SALES_TAXES_PAYABLE', accountType: Liability, accountSubtype: { value: 'SALES_TAXES_PAYABLE', displayName: 'Sales Taxes Payable' }, normality: Credit }),
      makeAccount({ name: 'Other Taxes Payable', stableName: 'OTHER_TAXES_PAYABLE', accountType: Liability, accountSubtype: { value: 'OTHER_TAXES_PAYABLE', displayName: 'Other Taxes Payable' }, normality: Credit }),
      makeAccount({ name: 'Lines of Credit', stableName: 'LINE_OF_CREDIT', accountType: Liability, accountSubtype: { value: 'LINE_OF_CREDIT', displayName: 'Lines of Credit' }, normality: Credit }),
      makeAccount({ name: 'Notes Payable', stableName: 'NOTES_PAYABLE', accountType: Liability, accountSubtype: { value: 'NOTES_PAYABLE', displayName: 'Notes Payable' }, normality: Credit }),
      makeAccount({ name: 'Collected Tips', stableName: 'TIPS', accountType: Liability, accountSubtype: { value: 'TIPS', displayName: 'Tips' }, normality: Credit }),
      makeAccount({ name: 'Unearned Revenue', stableName: 'UNEARNED_REVENUE', accountType: Liability, accountSubtype: { value: 'UNEARNED_REVENUE', displayName: 'Unearned Revenue' }, normality: Credit }),
      makeAccount({ name: 'Undeposited Payments', stableName: 'UNDEPOSITED_PAYMENTS', accountType: Liability, accountSubtype: { value: 'UNDEPOSITED_OUTFLOWS', displayName: 'Undeposited Outflows' }, normality: Credit }),
    ],
  }),
  makeAccount({
    name: 'Equity',
    stableName: 'EQUITY',
    accountType: Equity,
    accountSubtype: { value: 'OTHER_EQUITY', displayName: 'Equities' },
    normality: Credit,
    subAccounts: [
      makeAccount({ name: 'Contributions', stableName: 'CONTRIBUTIONS', accountType: Equity, accountSubtype: { value: 'CONTRIBUTIONS', displayName: 'Contributions' }, normality: Credit }),
      makeAccount({
        name: 'Distributions',
        stableName: 'DISTRIBUTIONS',
        accountType: Equity,
        accountSubtype: { value: 'DISTRIBUTIONS', displayName: 'Distributions' },
        normality: Debit,
        subAccounts: [
          makeAccount({ name: 'Owner\'s Draw', stableName: 'OWNERS_DRAW', accountType: Equity, accountSubtype: { value: 'DISTRIBUTIONS', displayName: 'Distributions' }, normality: Debit }),
        ],
      }),
      makeAccount({ name: 'Retained Earnings', stableName: 'RETAINED_EARNINGS', accountType: Equity, accountSubtype: { value: 'RETAINED_EARNINGS', displayName: 'Retained Earnings' }, normality: Credit }),
      makeAccount({ name: 'Accumulated Adjustments', stableName: 'ACCUMULATED_ADJUSTMENTS', accountType: Equity, accountSubtype: { value: 'ACCUMULATED_ADJUSTMENTS', displayName: 'Accumulated Adjustments' }, normality: Credit }),
      makeAccount({ name: 'Opening Balance Equity', stableName: 'OPENING_BALANCE_EQUITY', accountType: Equity, accountSubtype: { value: 'OPENING_BALANCE_EQUITY', displayName: 'Opening Balance Equity' }, normality: Credit }),
      makeAccount({ name: 'Owner\'s Capital', stableName: 'OWNERS_CAPITAL', accountType: Equity, accountSubtype: { value: 'OWNERS_CAPITAL', displayName: 'Owner\'s Capital' }, normality: Credit }),
    ],
  }),
  makeAccount({
    name: 'Revenue',
    stableName: 'REVENUE',
    accountType: Revenue,
    accountSubtype: { value: 'OTHER_INCOME', displayName: 'Other Income' },
    normality: Credit,
    subAccounts: [
      makeAccount({ name: 'Sales', stableName: 'SALES', accountType: Revenue, accountSubtype: { value: 'SALES', displayName: 'Sales' }, normality: Credit }),
      makeAccount({ name: 'Uncategorized Revenue', stableName: 'UNCATEGORIZED_REVENUE', accountType: Revenue, accountSubtype: { value: 'UNCATEGORIZED_REVENUE', displayName: 'Uncategorized Revenue' }, normality: Credit }),
      makeAccount({
        name: 'Returns and Allowances',
        stableName: 'RETURNS_AND_ALLOWANCES',
        accountType: Revenue,
        accountSubtype: { value: 'RETURNS_ALLOWANCES', displayName: 'Returns & Allowances' },
        normality: Debit,
        subAccounts: [
          makeAccount({ name: 'Discounts', stableName: 'DISCOUNTS', accountType: Revenue, accountSubtype: { value: 'RETURNS_ALLOWANCES', displayName: 'Returns & Allowances' }, normality: Debit }),
          makeAccount({ name: 'Customer Refunds', stableName: 'CUSTOMER_REFUNDS', accountType: Revenue, accountSubtype: { value: 'RETURNS_ALLOWANCES', displayName: 'Returns & Allowances' }, normality: Debit }),
        ],
      }),
    ],
  }),
  makeAccount({
    name: 'Expenses',
    stableName: 'EXPENSES',
    accountType: Expense,
    accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' },
    normality: Debit,
    subAccounts: [
      makeAccount({
        name: 'Cost of Goods Sold',
        stableName: 'COST_OF_GOODS_SOLD',
        accountType: Expense,
        accountSubtype: { value: 'COGS', displayName: 'COGS' },
        normality: Debit,
        subAccounts: [
          makeAccount({ name: 'Items for Resale', stableName: 'ITEMS_FOR_RESALE', accountType: Expense, accountSubtype: { value: 'COGS', displayName: 'COGS' }, normality: Debit }),
          makeAccount({ name: 'Materials for Sold Goods', stableName: 'MATERIALS', accountType: Expense, accountSubtype: { value: 'COGS', displayName: 'COGS' }, normality: Debit }),
        ],
      }),
      makeAccount({
        name: 'Operating Expenses',
        stableName: 'OPERATING_EXPENSES',
        accountType: Expense,
        accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' },
        normality: Debit,
        subAccounts: [
          makeAccount({ name: 'Uncategorized Expenses', stableName: 'UNCATEGORIZED_EXPENSES', accountType: Expense, accountSubtype: { value: 'UNCATEGORIZED_EXPENSE', displayName: 'Uncategorized Expense' }, normality: Debit }),
          makeAccount({
            name: 'Payroll and Contractors',
            stableName: 'PAYROLL',
            accountType: Expense,
            accountSubtype: { value: 'PAYROLL', displayName: 'Payroll' },
            normality: Debit,
            subAccounts: [
              makeAccount({ name: 'Employee Wages', stableName: 'PAYROLL_REGULAR_WAGES', accountType: Expense, accountSubtype: { value: 'PAYROLL', displayName: 'Payroll' }, normality: Debit }),
              makeAccount({ name: 'Contractors', stableName: 'PAYROLL_CONTRACTORS', accountType: Expense, accountSubtype: { value: 'PAYROLL', displayName: 'Payroll' }, normality: Debit }),
              makeAccount({ name: 'Payroll Fees', stableName: 'PAYROLL_FEES', accountType: Expense, accountSubtype: { value: 'PAYROLL', displayName: 'Payroll' }, normality: Debit }),
            ],
          }),
          makeAccount({ name: 'Rent', stableName: 'RENT', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Utilities', stableName: 'UTILITIES', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Business Insurance', stableName: 'INSURANCE', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Marketing', stableName: 'MARKETING', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Office Expenses', stableName: 'OFFICE_EXPENSES', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Business Travel', stableName: 'TRAVEL', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Business Meals', stableName: 'MEALS', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Software', stableName: 'SOFTWARE', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({
            name: 'Fees',
            stableName: 'FEES',
            accountType: Expense,
            accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' },
            normality: Debit,
            subAccounts: [
              makeAccount({ name: 'Bank Fees', stableName: 'BANK_FEES', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
              makeAccount({ name: 'Other Fees', stableName: 'OTHER_FEES', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
            ],
          }),
          makeAccount({ name: 'Other Business Expenses', stableName: 'OTHER_BUSINESS_EXPENSES', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Bad Debt', stableName: 'BAD_DEBT', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Equipment & Machinery', stableName: 'EQUIPMENT', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Phone', stableName: 'PHONE', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Legal and Professional Services', stableName: 'PROFESSIONAL_SERVICES', accountType: Expense, accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' }, normality: Debit }),
          makeAccount({ name: 'Interest Expense', stableName: 'INTEREST_EXPENSE', accountType: Expense, accountSubtype: { value: 'INTEREST_EXPENSES', displayName: 'Interest Expenses' }, normality: Debit }),
        ],
      }),
      makeAccount({
        name: 'Taxes',
        stableName: 'TAXES',
        accountType: Expense,
        accountSubtype: { value: 'TAXES_LICENSES', displayName: 'Taxes & Licenses' },
        normality: Debit,
        subAccounts: [
          makeAccount({ name: 'Sales Tax', stableName: 'SALES_TAXES', accountType: Expense, accountSubtype: { value: 'TAXES_LICENSES', displayName: 'Taxes & Licenses' }, normality: Debit }),
          makeAccount({ name: 'Income Tax', stableName: 'INCOME_TAXES', accountType: Expense, accountSubtype: { value: 'TAXES_LICENSES', displayName: 'Taxes & Licenses' }, normality: Debit }),
          makeAccount({ name: 'Payroll Tax', stableName: 'PAYROLL_TAXES', accountType: Expense, accountSubtype: { value: 'TAXES_LICENSES', displayName: 'Taxes & Licenses' }, normality: Debit }),
          makeAccount({ name: 'Other Tax', stableName: 'OTHER_TAXES', accountType: Expense, accountSubtype: { value: 'TAXES_LICENSES', displayName: 'Taxes & Licenses' }, normality: Debit }),
        ],
      }),
    ],
  }),
]

const flattenChartAccounts = (nodes: readonly BaseChartAccountNode[]): BaseChartAccount[] =>
  nodes.flatMap(({ subAccounts, ...account }) => [account, ...flattenChartAccounts(subAccounts)])

export const FLAT_BASE_CHART_OF_ACCOUNTS: readonly BaseChartAccount[] =
  flattenChartAccounts(BASE_CHART_OF_ACCOUNTS)

const collectParents = (
  nodes: readonly BaseChartAccountNode[],
  into: Record<string, string>,
): Record<string, string> => {
  nodes.forEach((node) => {
    node.subAccounts.forEach((child) => {
      into[child.stableName ?? ''] = node.stableName ?? ''
    })
    collectParents(node.subAccounts, into)
  })

  return into
}

export const PARENT_BY_STABLE_NAME: Readonly<Record<string, string>> =
  collectParents(BASE_CHART_OF_ACCOUNTS, {})

export const ROOT_STABLE_NAMES: readonly string[] =
  BASE_CHART_OF_ACCOUNTS.map(node => node.stableName ?? '')
