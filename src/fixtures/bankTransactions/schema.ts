import { Arbitrary, type FastCheck, Schema } from 'effect'

import {
  BankTransactionSchema,
  CategorizationStatus,
  InputStrategy,
} from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { withArbitrary } from '@fixtures/utils/withArbitrary'

const ACCOUNT_NAMES = [
  'Primary Checking',
  'Business Checking',
  'Operating Account',
  'Savings',
  'Business Credit Card',
] as const

const INSTITUTION_NAMES = [
  'Chase',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'Capital One',
  'American Express',
] as const

/*
 * Nested categorization/match structures are modelled with fixture-local
 * schemas (mirroring the real schemas' Type side) so the generated JSON
 * fixture stays serializable: dates are ISO strings and enums are plain
 * strings. The MSW handler revives dates before encoding via the real
 * BankTransactionSchema.
 */
const AccountCategorizationFixtureSchema = Schema.Struct({
  type: Schema.Literal('Account'),
  id: Schema.String,
  stableName: Schema.NullOr(Schema.String),
  category: Schema.String,
  displayName: Schema.String,
})

const AccountSplitEntryFixtureSchema = Schema.Struct({
  type: Schema.Literal('AccountSplitEntry'),
  amount: Schema.Number,
  category: AccountCategorizationFixtureSchema,
  // Split entries never carry tags in fixtures; Unknown keeps the arbitrary
  // derivable (the deriver eagerly compiles every leaf, and Never has none).
  tags: Schema.Array(Schema.Unknown).annotations({
    arbitrary: () => fc => fc.constant([]),
  }),
})

const SplitCategorizationFixtureSchema = Schema.Struct({
  type: Schema.Literal('Split_Categorization'),
  id: Schema.String,
  category: Schema.String,
  displayName: Schema.String,
  entries: Schema.Array(AccountSplitEntryFixtureSchema),
})

const CategorizationFixtureSchema = Schema.Union(
  AccountCategorizationFixtureSchema,
  SplitCategorizationFixtureSchema,
)

const CategorizationFlowFixtureSchema = Schema.Struct({
  type: Schema.String,
  category: Schema.Null,
  suggestions: Schema.Array(AccountCategorizationFixtureSchema),
})

const MinimalBankTransactionFixtureSchema = Schema.Struct({
  id: Schema.String,
  date: Schema.String,
  direction: Schema.String,
  amount: Schema.Number,
  counterpartyName: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
})

const baseMatchDetailsFixtureFields = {
  id: Schema.String,
  amount: Schema.Number,
  date: Schema.String,
  description: Schema.String,
  adjustment: Schema.Null,
}

const TransferMatchDetailsFixtureSchema = Schema.Struct({
  ...baseMatchDetailsFixtureFields,
  type: Schema.Literal('Transfer_Match'),
  fromAccountName: Schema.String,
  toAccountName: Schema.String,
})

const PayoutMatchDetailsFixtureSchema = Schema.Struct({
  ...baseMatchDetailsFixtureFields,
  type: Schema.Literal('Payout_Match'),
})

const BillMatchDetailsFixtureSchema = Schema.Struct({
  ...baseMatchDetailsFixtureFields,
  type: Schema.Literal('Bill_Match'),
  billIdentifiers: Schema.Array(Schema.Struct({ id: Schema.String })),
})

const MatchDetailsFixtureSchema = Schema.Union(
  TransferMatchDetailsFixtureSchema,
  PayoutMatchDetailsFixtureSchema,
  BillMatchDetailsFixtureSchema,
)

const MatchFixtureSchema = Schema.Struct({
  id: Schema.String,
  matchType: Schema.String,
  bankTransaction: MinimalBankTransactionFixtureSchema,
  details: MatchDetailsFixtureSchema,
})

const SuggestedMatchFixtureSchema = Schema.Struct({
  id: Schema.String,
  details: MatchDetailsFixtureSchema,
})

type AccountCategorizationFixture = typeof AccountCategorizationFixtureSchema.Type
type MatchDetailsFixture = typeof MatchDetailsFixtureSchema.Type

type CategoryDef = {
  id: string
  stableName: string
  displayName: string
}

const CATEGORIES = {
  advertising: { id: 'category-advertising', stableName: 'ADVERTISING_AND_MARKETING', displayName: 'Advertising & Marketing' },
  autoAndFuel: { id: 'category-auto-and-fuel', stableName: 'AUTO_AND_FUEL', displayName: 'Auto & Fuel' },
  equipment: { id: 'category-equipment', stableName: 'EQUIPMENT', displayName: 'Equipment' },
  insurance: { id: 'category-insurance', stableName: 'INSURANCE', displayName: 'Insurance' },
  meals: { id: 'category-meals', stableName: 'MEALS_AND_ENTERTAINMENT', displayName: 'Meals & Entertainment' },
  officeSupplies: { id: 'category-office-supplies', stableName: 'OFFICE_SUPPLIES', displayName: 'Office Supplies' },
  payroll: { id: 'category-payroll', stableName: 'PAYROLL', displayName: 'Payroll' },
  phoneAndInternet: { id: 'category-phone-and-internet', stableName: 'PHONE_AND_INTERNET', displayName: 'Phone & Internet' },
  rent: { id: 'category-rent', stableName: 'RENT_AND_LEASE', displayName: 'Rent & Lease' },
  repairs: { id: 'category-repairs', stableName: 'REPAIRS_AND_MAINTENANCE', displayName: 'Repairs & Maintenance' },
  sales: { id: 'category-sales', stableName: 'SALES', displayName: 'Sales' },
  shipping: { id: 'category-shipping', stableName: 'SHIPPING_AND_POSTAGE', displayName: 'Shipping & Postage' },
  software: { id: 'category-software', stableName: 'SOFTWARE_SUBSCRIPTIONS', displayName: 'Software & Subscriptions' },
  supplies: { id: 'category-supplies', stableName: 'SUPPLIES', displayName: 'Supplies & Materials' },
  travel: { id: 'category-travel', stableName: 'TRAVEL', displayName: 'Travel' },
} satisfies Record<string, CategoryDef>

type VendorDef = {
  name: string
  direction: BankTransactionDirection
  describe: (ref: number) => string
  primary: CategoryDef
  alternates: readonly CategoryDef[]
  amountRange: readonly [number, number]
}

// Recognizable vendors paired with the categories a bookkeeper would
// realistically apply (or be suggested) for that vendor's purchases.
const VENDORS: readonly VendorDef[] = [
  { name: 'Amazon', direction: BankTransactionDirection.Debit, describe: ref => `AMAZON MKTPL*${ref} AMZN.COM/BILL WA`, primary: CATEGORIES.officeSupplies, alternates: [CATEGORIES.supplies, CATEGORIES.equipment], amountRange: [12, 400] },
  { name: 'Staples', direction: BankTransactionDirection.Debit, describe: ref => `STAPLES 00${ref} SAN FRANCISCO CA`, primary: CATEGORIES.officeSupplies, alternates: [CATEGORIES.supplies], amountRange: [8, 250] },
  { name: 'Starbucks', direction: BankTransactionDirection.Debit, describe: ref => `STARBUCKS STORE ${ref} SEATTLE WA`, primary: CATEGORIES.meals, alternates: [CATEGORIES.travel], amountRange: [4, 40] },
  { name: 'Chipotle', direction: BankTransactionDirection.Debit, describe: ref => `CHIPOTLE ${ref} AUSTIN TX`, primary: CATEGORIES.meals, alternates: [], amountRange: [9, 80] },
  { name: 'Uber', direction: BankTransactionDirection.Debit, describe: ref => `UBER TRIP ${ref} HELP.UBER.COM`, primary: CATEGORIES.travel, alternates: [CATEGORIES.meals], amountRange: [8, 90] },
  { name: 'Delta Air Lines', direction: BankTransactionDirection.Debit, describe: ref => `DELTA AIR LINES ATL ${ref}`, primary: CATEGORIES.travel, alternates: [], amountRange: [150, 1400] },
  { name: 'Marriott', direction: BankTransactionDirection.Debit, describe: ref => `MARRIOTT ${ref} SAN FRANCISCO CA`, primary: CATEGORIES.travel, alternates: [CATEGORIES.meals], amountRange: [120, 900] },
  { name: 'Shell', direction: BankTransactionDirection.Debit, describe: ref => `SHELL OIL ${ref} HOUSTON TX`, primary: CATEGORIES.autoAndFuel, alternates: [CATEGORIES.travel], amountRange: [20, 120] },
  { name: 'The Home Depot', direction: BankTransactionDirection.Debit, describe: ref => `THE HOME DEPOT #${String(ref).slice(0, 4)} DENVER CO`, primary: CATEGORIES.repairs, alternates: [CATEGORIES.supplies, CATEGORIES.equipment], amountRange: [15, 600] },
  { name: 'Costco', direction: BankTransactionDirection.Debit, describe: ref => `COSTCO WHSE #${String(ref).slice(0, 4)} PORTLAND OR`, primary: CATEGORIES.supplies, alternates: [CATEGORIES.meals, CATEGORIES.officeSupplies], amountRange: [40, 700] },
  { name: 'Apple', direction: BankTransactionDirection.Debit, describe: ref => `APPLE.COM/BILL ${ref} CUPERTINO CA`, primary: CATEGORIES.software, alternates: [CATEGORIES.equipment], amountRange: [1, 2500] },
  { name: 'Adobe', direction: BankTransactionDirection.Debit, describe: ref => `ADOBE *CREATIVE CLOUD ${ref}`, primary: CATEGORIES.software, alternates: [], amountRange: [20, 80] },
  { name: 'Google', direction: BankTransactionDirection.Debit, describe: ref => `GOOGLE *GSUITE ${ref}`, primary: CATEGORIES.software, alternates: [CATEGORIES.advertising], amountRange: [6, 300] },
  { name: 'Amazon Web Services', direction: BankTransactionDirection.Debit, describe: ref => `AMAZON WEB SERVICES AWS.AMAZON.CO ${ref}`, primary: CATEGORIES.software, alternates: [], amountRange: [20, 1500] },
  { name: 'Comcast', direction: BankTransactionDirection.Debit, describe: ref => `COMCAST CABLE COMM ${ref}`, primary: CATEGORIES.phoneAndInternet, alternates: [], amountRange: [60, 300] },
  { name: 'Verizon', direction: BankTransactionDirection.Debit, describe: ref => `VZWRLSS*APOCC VISB ${ref}`, primary: CATEGORIES.phoneAndInternet, alternates: [], amountRange: [45, 250] },
  { name: 'FedEx', direction: BankTransactionDirection.Debit, describe: ref => `FEDEX ${ref} MEMPHIS TN`, primary: CATEGORIES.shipping, alternates: [], amountRange: [9, 150] },
  { name: 'WeWork', direction: BankTransactionDirection.Debit, describe: ref => `WEWORK ${ref} NEW YORK NY`, primary: CATEGORIES.rent, alternates: [], amountRange: [350, 2500] },
  { name: 'Gusto', direction: BankTransactionDirection.Debit, describe: ref => `GUSTO PAY ${ref}`, primary: CATEGORIES.payroll, alternates: [], amountRange: [800, 9000] },
  { name: 'State Farm', direction: BankTransactionDirection.Debit, describe: ref => `STATE FARM INSURANCE ${ref}`, primary: CATEGORIES.insurance, alternates: [], amountRange: [80, 400] },
  { name: 'Meta', direction: BankTransactionDirection.Debit, describe: ref => `FACEBK ADS ${ref}`, primary: CATEGORIES.advertising, alternates: [], amountRange: [25, 1200] },
  { name: 'Stripe', direction: BankTransactionDirection.Credit, describe: ref => `STRIPE TRANSFER ST-${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [100, 9000] },
  { name: 'Square', direction: BankTransactionDirection.Credit, describe: ref => `SQUARE INC ${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [50, 4000] },
  { name: 'Shopify', direction: BankTransactionDirection.Credit, describe: ref => `SHOPIFY PAYMENTS ${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [80, 6000] },
  { name: 'PayPal', direction: BankTransactionDirection.Credit, describe: ref => `PAYPAL TRANSFER ${ref}`, primary: CATEGORIES.sales, alternates: [], amountRange: [20, 1500] },
]

const isoTimestampArbitrary = (fc: typeof FastCheck) =>
  fc
    .date({
      min: new Date('2024-01-01T00:00:00Z'),
      max: new Date('2025-12-31T23:59:59Z'),
      noInvalidDate: true,
    })
    .map(date => date.toISOString())

const fields = BankTransactionSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => fc => fc.uuid()),
  businessId: withArbitrary(fields.businessId, () => fc =>
    fc.constant('00000000-0000-4000-8000-000000000001')),
  sourceTransactionId: withArbitrary(fields.sourceTransactionId, () => fc =>
    fc.integer({ min: 100000, max: 999999 }).map(n => `src_txn_${n}`)),
  sourceAccountId: withArbitrary(fields.sourceAccountId, () => fc =>
    fc.constantFrom(
      'acc_00000000000000000000000001',
      'acc_00000000000000000000000002',
    )),
  // `date`, `direction`, and `categorizationStatus` are modelled as strings here
  // (mirroring customAccounts) so the generated JSON fixture satisfies the schema
  // Type. The MSW handler revives `date` to a Date before encoding via the real
  // BankTransactionSchema; the string enum values are valid enum members at runtime.
  date: Schema.String.annotations({ arbitrary: () => isoTimestampArbitrary }),
  direction: Schema.String.annotations({
    arbitrary: () => fc => fc.constantFrom(...Object.values(BankTransactionDirection)),
  }),
  amount: withArbitrary(fields.amount, () => fc =>
    fc.integer({ min: 100, max: 1_000_000 }).map(cents => cents / 100)),
  counterpartyName: withArbitrary(fields.counterpartyName, () => fc => fc.constant(null)),
  description: withArbitrary(fields.description, () => fc => fc.constant(null)),
  accountName: withArbitrary(fields.accountName, () => fc =>
    fc.constantFrom(...ACCOUNT_NAMES)),
  accountMask: withArbitrary(fields.accountMask, () => fc =>
    fc.integer({ min: 0, max: 9999 }).map(n => String(n).padStart(4, '0'))),
  accountInstitution: withArbitrary(fields.accountInstitution, () => fc =>
    fc.constantFrom(...INSTITUTION_NAMES).map(name => ({ name, logo: null }))),
  categorizationStatus: Schema.String.annotations({
    arbitrary: () => fc => fc.constant(CategorizationStatus.PENDING),
  }),

  // The correlated categorization/match structures are filled in by the
  // top-level arbitrary below; the field-level constants only exist so the
  // base struct stays derivable.
  category: Schema.NullOr(CategorizationFixtureSchema).annotations({
    arbitrary: () => fc => fc.constant(null),
  }),
  categorizationFlow: Schema.NullOr(CategorizationFlowFixtureSchema).annotations({
    arbitrary: () => fc => fc.constant(null),
  }),
  taxCode: withArbitrary(fields.taxCode, () => fc => fc.constant(null)),
  taxOptions: withArbitrary(fields.taxOptions, () => fc => fc.constant(null)),
  suggestedMatches: Schema.Array(SuggestedMatchFixtureSchema).annotations({
    arbitrary: () => fc => fc.constant([]),
  }),
  match: Schema.NullOr(MatchFixtureSchema).annotations({
    arbitrary: () => fc => fc.constant(null),
  }),
  transactionTags: withArbitrary(fields.transactionTags, () => fc => fc.constant([])),
  documentIds: withArbitrary(fields.documentIds, () => fc => fc.constant([])),
  memo: withArbitrary(fields.memo, () => fc => fc.constant(null)),
  referenceNumber: withArbitrary(fields.referenceNumber, () => fc => fc.constant(null)),
  metadata: withArbitrary(fields.metadata, () => fc => fc.constant(null)),
  customer: withArbitrary(fields.customer, () => fc => fc.constant(null)),
  vendor: withArbitrary(fields.vendor, () => fc => fc.constant(null)),
  updateCategorizationRulesSuggestion: withArbitrary(
    fields.updateCategorizationRulesSuggestion,
    () => fc => fc.constant(null),
  ),
})

type BaseFixture = typeof base.Type

const toAccountCategorization = (category: CategoryDef): AccountCategorizationFixture => ({
  type: 'Account',
  id: category.id,
  stableName: category.stableName,
  category: category.stableName,
  displayName: category.displayName,
})

const roundToCents = (amount: number) => Math.round(amount * 100) / 100

const deriveTransfer = (transaction: BaseFixture, statusRoll: number, ref: number): BaseFixture => {
  const outbound = statusRoll % 2 === 0
  const accountName = transaction.accountName ?? 'Business Checking'
  const fromAccountName = outbound ? accountName : 'Savings'
  const toAccountName = outbound ? 'Savings' : accountName
  const description = outbound
    ? `ONLINE TRANSFER TO SAVINGS ACCOUNT XXXXXX${String(ref).slice(0, 4)}`
    : `ONLINE TRANSFER FROM SAVINGS ACCOUNT XXXXXX${String(ref).slice(0, 4)}`

  const details: MatchDetailsFixture = {
    type: 'Transfer_Match',
    id: `match-details-${transaction.id}`,
    amount: transaction.amount,
    date: transaction.date,
    description: `Transfer between ${fromAccountName} and ${toAccountName}`,
    adjustment: null,
    fromAccountName,
    toAccountName,
  }

  const common = {
    ...transaction,
    direction: outbound ? BankTransactionDirection.Debit : BankTransactionDirection.Credit,
    counterpartyName: null,
    description,
  }

  // Half the transfers are already matched; the other half surface a
  // suggested transfer match awaiting review.
  if (statusRoll < 6) {
    return {
      ...common,
      categorizationStatus: CategorizationStatus.MATCHED,
      match: {
        id: `match-${transaction.id}`,
        matchType: 'TRANSFER',
        bankTransaction: {
          id: transaction.id,
          date: transaction.date,
          direction: common.direction,
          amount: transaction.amount,
          counterpartyName: null,
          description,
        },
        details,
      },
    }
  }

  return {
    ...common,
    categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
    suggestedMatches: [{ id: `suggested-match-${transaction.id}`, details }],
  }
}

const deriveVendorMatch = (
  transaction: BaseFixture,
  vendor: VendorDef,
  amount: number,
  description: string,
): BaseFixture => {
  const isInflow = vendor.direction === BankTransactionDirection.Credit
  const details: MatchDetailsFixture = isInflow
    ? {
      type: 'Payout_Match',
      id: `match-details-${transaction.id}`,
      amount,
      date: transaction.date,
      description: `Payout from ${vendor.name}`,
      adjustment: null,
    }
    : {
      type: 'Bill_Match',
      id: `match-details-${transaction.id}`,
      amount,
      date: transaction.date,
      description: `Bill payment to ${vendor.name}`,
      adjustment: null,
      billIdentifiers: [{ id: `bill-${transaction.id}` }],
    }

  return {
    ...transaction,
    categorizationStatus: CategorizationStatus.MATCHED,
    match: {
      id: `match-${transaction.id}`,
      matchType: isInflow ? 'PAYOUT' : 'BILL_PAYMENT',
      bankTransaction: {
        id: transaction.id,
        date: transaction.date,
        direction: vendor.direction,
        amount,
        counterpartyName: vendor.name,
        description,
      },
      details,
    },
  }
}

const derive = (
  transaction: BaseFixture,
  vendorIndex: number,
  statusRoll: number,
  ref: number,
  amountRoll: number,
  splitPercent: number,
): BaseFixture => {
  if (statusRoll < 12) return deriveTransfer(transaction, statusRoll, ref)

  const vendor = VENDORS[vendorIndex % VENDORS.length]
  const [min, max] = vendor.amountRange
  const amount = roundToCents(min + (amountRoll % ((max - min) * 100)) / 100)
  const description = vendor.describe(ref)

  const common = {
    ...transaction,
    direction: vendor.direction,
    amount,
    counterpartyName: vendor.name,
    description,
  }

  if (statusRoll < 16) {
    return { ...common, categorizationStatus: CategorizationStatus.PENDING }
  }

  if (statusRoll < 50) {
    return {
      ...common,
      categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
      categorizationFlow: {
        type: InputStrategy.AskFromSuggestions,
        category: null,
        suggestions: [vendor.primary, ...vendor.alternates].map(toAccountCategorization),
      },
    }
  }

  if (statusRoll < 80 || vendor.alternates.length === 0) {
    return {
      ...common,
      categorizationStatus: CategorizationStatus.CATEGORIZED,
      category: toAccountCategorization(vendor.primary),
    }
  }

  if (statusRoll < 90) {
    const firstAmount = roundToCents(amount * (splitPercent / 100))
    const secondAmount = roundToCents(amount - firstAmount)
    return {
      ...common,
      categorizationStatus: CategorizationStatus.SPLIT,
      category: {
        type: 'Split_Categorization',
        id: `split-${transaction.id}`,
        category: 'SPLIT',
        displayName: 'Split',
        entries: [
          { type: 'AccountSplitEntry', amount: firstAmount, category: toAccountCategorization(vendor.primary), tags: [] },
          { type: 'AccountSplitEntry', amount: secondAmount, category: toAccountCategorization(vendor.alternates[0]), tags: [] },
        ],
      },
    }
  }

  return deriveVendorMatch(common, vendor, amount, description)
}

const baseArbitrary = Arbitrary.make(base)

export const BankTransactionArbitrarySchema = base.annotations({
  arbitrary: () => fc =>
    fc
      .tuple(
        baseArbitrary,
        // noBias keeps the rolls uniform; fast-check otherwise skews samples
        // toward the minimum, collapsing the status/amount distributions.
        fc.noBias(fc.nat(VENDORS.length - 1)),
        fc.noBias(fc.nat(99)),
        fc.noBias(fc.integer({ min: 100000, max: 999999 })),
        fc.noBias(fc.nat(999999)),
        fc.noBias(fc.integer({ min: 20, max: 80 })),
      )
      .map(([transaction, vendorIndex, statusRoll, ref, amountRoll, splitPercent]) =>
        derive(transaction, vendorIndex, statusRoll, ref, amountRoll, splitPercent)),
})

export const schema = BankTransactionArbitrarySchema

export type BankTransactionFixture = typeof schema.Type
