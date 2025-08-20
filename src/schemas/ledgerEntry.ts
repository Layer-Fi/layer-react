import { Schema, pipe } from 'effect'
import { CustomerSchema } from './customer'
import { VendorSchema } from './vendor'
import { LedgerEntrySourceSchema } from './ledgerEntrySource'

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

export enum ClassifierAgent {
  Api = 'API',
}
const ClassifierAgentSchema = Schema.Enums(ClassifierAgent)

export enum EntryType {
  Expense = 'EXPENSE',
}
const EntryTypeSchema = Schema.Enums(EntryType)

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

export type AccountIdentifier = typeof AccountIdentifierSchema.Type
export type LedgerAccount = typeof LedgerAccountSchema.Type

export const LedgerAccountLineItemSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  account: LedgerAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  date: Schema.Date,
  source: LedgerEntrySourceSchema,
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_reversed_by'),
  ),
  isReversed: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_reversed'),
  ),
  runningBalance: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('running_balance'),
  ),
})

export const LedgerEntryLineItemSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: LedgerAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
})

export const LedgerEntrySchema = Schema.Struct({
  id: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  ledgerId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('ledger_id'),
  ),
  agent: ClassifierAgentSchema,
  entryType: pipe(
    Schema.propertySignature(EntryTypeSchema),
    Schema.fromKey('entry_type'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  date: Schema.Date,
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  reversalOfId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reversal_of_id'),
  ),
  reversalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reversal_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(LedgerEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  source: LedgerEntrySourceSchema,
  memo: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
