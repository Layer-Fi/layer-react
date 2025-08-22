import { Schema, pipe } from 'effect'
import { LedgerAccountNodeType } from '../../types/chart_of_accounts'

export const AccountTypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountSubtypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('stable_name'),
  ),
  normality: Schema.String,
  accountType: pipe(
    Schema.propertySignature(AccountTypeSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(AccountSubtypeSchema),
    Schema.fromKey('account_subtype'),
  ),
})

export enum LedgerEntryDirection {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}
export const LedgerEntryDirectionSchema = Schema.Enums(LedgerEntryDirection)

export enum LedgerAccountType {
  Asset = 'ASSET',
  Liability = 'LIABILITY',
  Equity = 'EQUITY',
  Revenue = 'REVENUE',
  Expense = 'EXPENSE',
}
export const LedgerAccountTypeSchema = Schema.Enums(LedgerAccountType)

export enum LedgerAccountSubtype {
  // Assets
  BankAccounts = 'BANK_ACCOUNTS',
  AccountsReceivable = 'ACCOUNTS_RECEIVABLE',
  Inventory = 'INVENTORY',
  PaymentProcessorClearingAccount = 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT',
  FixedAsset = 'FIXED_ASSET',
  AccumulatedDepreciation = 'ACCUMULATED_DEPRECIATION',
  Cash = 'CASH',
  UndepositedFunds = 'UNDEPOSITED_FUNDS',
  CurrentAsset = 'CURRENT_ASSET',
  NonCurrentAsset = 'NON_CURRENT_ASSET',
  PrepaidExpenses = 'PREPAID_EXPENSES',
  DevelopmentCosts = 'DEVELOPMENT_COSTS',
  LoansReceivable = 'LOANS_RECEIVABLE',
  RefundsReceivable = 'REFUNDS_RECEIVABLE',
  IntangibleAsset = 'INTANGIBLE_ASSET',

  // Liabilities
  Liability = 'LIABILITY', // @Deprecated
  AccountsPayable = 'ACCOUNTS_PAYABLE',
  CreditCard = 'CREDIT_CARD',
  TaxesPayable = 'TAXES_PAYABLE', // @Deprecated
  IncomeTaxesPayable = 'INCOME_TAXES_PAYABLE',
  SalesTaxesPayable = 'SALES_TAXES_PAYABLE',
  OtherTaxesPayable = 'OTHER_TAXES_PAYABLE',
  PayrollTaxesPayable = 'PAYROLL_TAXES_PAYABLE',
  TaxLiability = 'TAX_LIABILITY', // @Deprecated
  UnearnedRevenue = 'UNEARNED_REVENUE',
  PayrollLiability = 'PAYROLL_LIABILITY',
  PayrollClearing = 'PAYROLL_CLEARING',
  LineOfCredit = 'LINE_OF_CREDIT',
  Tips = 'TIPS',
  RefundLiabilities = 'REFUND_LIABILITIES',
  UndepositedOutflows = 'UNDEPOSITED_OUTFLOWS',
  OutgoingPaymentClearingAccount = 'OUTGOING_PAYMENT_CLEARING_ACCOUNT',
  CurrentLiability = 'CURRENT_LIABILITY', // @Deprecated
  OtherCurrentLiability = 'OTHER_CURRENT_LIABILITY',
  LoansPayable = 'LOANS_PAYABLE',
  NotesPayable = 'NOTES_PAYABLE',
  ShareholderLoan = 'SHAREHOLDER_LOAN',
  NonCurrentLiability = 'NON_CURRENT_LIABILITY',

  // Equity
  Contributions = 'CONTRIBUTIONS',
  Distributions = 'DISTRIBUTIONS',
  CommonStock = 'COMMON_STOCK',
  PreferredStock = 'PREFERRED_STOCK',
  AdditionalPaidInCapital = 'ADDITIONAL_PAID_IN_CAPITAL',
  RetainedEarnings = 'RETAINED_EARNINGS',
  AccumulatedAdjustments = 'ACCUMULATED_ADJUSTMENTS',
  OpeningBalanceEquity = 'OPENING_BALANCE_EQUITY',
  OtherEquity = 'OTHER_EQUITY',
  Equity = 'EQUITY', // @Deprecated

  // Revenue
  Revenue = 'REVENUE',
  Sales = 'SALES',
  UncategorizedRevenue = 'UNCATEGORIZED_REVENUE',
  ReturnsAllowances = 'RETURNS_ALLOWANCES',
  DividendIncome = 'DIVIDEND_INCOME',
  InterestIncome = 'INTEREST_INCOME',
  OtherIncome = 'OTHER_INCOME',

  // Expenses
  Expense = 'EXPENSE', // @Deprecated
  Cogs = 'COGS',
  OperatingExpenses = 'OPERATING_EXPENSES',
  Payroll = 'PAYROLL',
  TaxesLicenses = 'TAXES_LICENSES',
  UncategorizedExpense = 'UNCATEGORIZED_EXPENSE',
  CharitableContributions = 'CHARITABLE_CONTRIBUTIONS',
  LoanExpenses = 'LOAN_EXPENSES',
  FinanceCosts = 'FINANCE_COSTS',
  InterestExpenses = 'INTEREST_EXPENSES',
  Depreciation = 'DEPRECIATION',
  Amortization = 'AMORTIZATION',
  BadDebt = 'BAD_DEBT',
  OtherExpenses = 'OTHER_EXPENSES',
}
export const LedgerAccountSubtypeSchema = Schema.Enums(LedgerAccountSubtype)

export const LedgerAccountTypeWithDisplayNameSchema = Schema.Struct({
  value: LedgerAccountTypeSchema,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const LedgerAccountSubtypeWithDisplayNameSchema = Schema.Struct({
  value: LedgerAccountSubtypeSchema,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountIdSchema = Schema.Struct({
  type: Schema.Literal('AccountId'),
  id: Schema.String,
})

export const AccountStableNameSchema = Schema.Struct({
  type: Schema.Literal('StableName'),
  stableName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('stable_name'),
  ),
})

export const AccountIdentifierSchema = Schema.Union(
  AccountIdSchema,
  AccountStableNameSchema,
)

export const LedgerAccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  normality: LedgerEntryDirectionSchema,
  accountType: pipe(
    Schema.propertySignature(LedgerAccountTypeWithDisplayNameSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(LedgerAccountSubtypeWithDisplayNameSchema),
    Schema.fromKey('account_subtype'),
  ),
})

export type AccountId = typeof AccountIdSchema.Type
export type AccountStableName = typeof AccountStableNameSchema.Type

export type AccountIdentifier = typeof AccountIdentifierSchema.Type
export type LedgerAccount = typeof LedgerAccountSchema.Type

const nestedLedgerAccountFields = {
  id: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('id'),
  ),
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  normality: LedgerEntryDirectionSchema,
  accountType: pipe(
    Schema.propertySignature(LedgerAccountTypeWithDisplayNameSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(LedgerAccountSubtypeWithDisplayNameSchema),
    Schema.fromKey('account_subtype'),
  ),
  balance: Schema.Number,
  isDeletable: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Boolean)),
    Schema.fromKey('is_deletable'),
  ),
}

export interface NestedLedgerAccount extends Schema.Struct.Type<typeof nestedLedgerAccountFields> {
  subAccounts: NestedLedgerAccount[]
}

export interface NestedLedgerAccountEncoded extends Schema.Struct.Encoded<typeof nestedLedgerAccountFields> {
  sub_accounts: NestedLedgerAccountEncoded[]
}

export const NestedLedgerAccountSchema = Schema.Struct({
  ...nestedLedgerAccountFields,
  subAccounts: pipe(
    Schema.propertySignature(Schema.mutable(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedLedgerAccount, NestedLedgerAccountEncoded> => NestedLedgerAccountSchema),
    ))),
    Schema.fromKey('sub_accounts'),
  ),
})

const nestedChartAccountFields = {
  accountId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('id'),
  ),
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  normality: LedgerEntryDirectionSchema,
  accountType: pipe(
    Schema.propertySignature(LedgerAccountTypeWithDisplayNameSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(LedgerAccountSubtypeWithDisplayNameSchema),
    Schema.fromKey('account_subtype'),
  ),
}

export interface NestedChartAccount extends Schema.Struct.Type<typeof nestedChartAccountFields> {
  subAccounts: NestedChartAccount[]
}

export interface NestedChartAccountEncoded extends Schema.Struct.Encoded<typeof nestedChartAccountFields> {
  sub_accounts: NestedChartAccountEncoded[]
}

export const NestedChartAccountSchema = Schema.Struct({
  ...nestedChartAccountFields,
  subAccounts: pipe(
    Schema.propertySignature(Schema.mutable(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedChartAccount, NestedChartAccountEncoded> => NestedChartAccountSchema),
    ))),
    Schema.fromKey('sub_accounts'),
  ),
})

export type NestedLedgerAccountType = typeof NestedLedgerAccountSchema.Type
export type NestedChartAccountType = typeof NestedChartAccountSchema.Type

export const ChartOfAccountsSchema = Schema.Struct({
  accounts: Schema.mutable(Schema.Array(NestedChartAccountSchema)),
})

export const LedgerBalancesSchema = Schema.Struct({
  accounts: Schema.mutable(Schema.Array(NestedLedgerAccountSchema)),
})

export type ChartOfAccounts = typeof ChartOfAccountsSchema.Type
export type LedgerBalances = typeof LedgerBalancesSchema.Type
export type AugmentedNestedLedgerAccount = NestedLedgerAccount & { isMatching?: true }
export type NestedLedgerAccountWithNodeType = NestedLedgerAccount & {
  nodeType: LedgerAccountNodeType
}
