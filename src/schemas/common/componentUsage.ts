import { pipe, Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'

/**
 * The public surfaces whose props are logged on mount. Deliberately separate from
 * `LayerEventComponent` — that one is exported to consumers and pinned in `src/index.test.ts`,
 * while this list is internal and tracks the whole export surface of `src/index.tsx`.
 */
export const PublicComponentName = {
  AccountingOverview: 'AccountingOverview',
  BalanceSheet: 'BalanceSheet',
  BankTransactions: 'BankTransactions',
  BankTransactionsWithLinkedAccounts: 'BankTransactionsWithLinkedAccounts',
  BookkeepingOverview: 'BookkeepingOverview',
  ChartOfAccounts: 'ChartOfAccounts',
  GeneralLedgerView: 'GeneralLedgerView',
  GlobalDateRangeSelection: 'GlobalDateRangeSelection',
  GlobalMonthPicker: 'GlobalMonthPicker',
  Invoices: 'Invoices',
  Journal: 'Journal',
  LandingPage: 'LandingPage',
  LinkAccounts: 'LinkAccounts',
  LinkedAccounts: 'LinkedAccounts',
  MileageSummaryCard: 'MileageSummaryCard',
  MileageTracking: 'MileageTracking',
  ProfitAndLoss: 'ProfitAndLoss',
  ProfitAndLossChart: 'ProfitAndLoss.Chart',
  ProfitAndLossDetailedCharts: 'ProfitAndLoss.DetailedCharts',
  ProfitAndLossReport: 'ProfitAndLoss.Report',
  ProfitAndLossSummaries: 'ProfitAndLoss.Summaries',
  Reports: 'Reports',
  SolopreneurOverview: 'SolopreneurOverview',
  StatementOfCashFlow: 'StatementOfCashFlow',
  Tasks: 'Tasks',
  TaxEstimates: 'TaxEstimates',
  TimeTracking: 'TimeTracking',
  UnifiedReports: 'UnifiedReports',
} as const

export type PublicComponentName = (typeof PublicComponentName)[keyof typeof PublicComponentName]

/** Coarse shape of a prop value. Values are never sent, so this is all the type information we get. */
export const PropKind = {
  Array: 'array',
  Boolean: 'boolean',
  Function: 'function',
  Node: 'node',
  Null: 'null',
  Number: 'number',
  Object: 'object',
  String: 'string',
} as const

export type PropKind = (typeof PropKind)[keyof typeof PropKind]

export const LoggedPropSchema = Schema.Struct({
  name: Schema.String,
  kind: Schema.Literal(
    PropKind.Array,
    PropKind.Boolean,
    PropKind.Function,
    PropKind.Node,
    PropKind.Null,
    PropKind.Number,
    PropKind.Object,
    PropKind.String,
  ),

  /** Only for `kind: 'boolean'` — the literal, so `showTitle={false}` is distinguishable. */
  booleanValue: pipe(
    Schema.optional(Schema.Boolean),
    Schema.fromKey('boolean_value'),
  ),

  /** Only for `kind: 'object'` — flattened dotted key paths, names only. */
  keys: Schema.optional(Schema.Array(Schema.String)),
})

export type LoggedProp = typeof LoggedPropSchema.Type

export const ComponentUsageBodySchema = Schema.Struct({
  component: Schema.String,

  /** The nearest enclosing tracked component. `null` means the consumer mounted this directly. */
  parentComponent: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('parent_component'),
  ),

  environment: Schema.optional(Schema.String),

  props: Schema.Array(LoggedPropSchema),
})

export const encodeComponentUsageBody = Schema.encodeSync(ComponentUsageBodySchema)
export type ComponentUsageBody = typeof ComponentUsageBodySchema.Type
export type ComponentUsageBodyEncoded = typeof ComponentUsageBodySchema.Encoded

/**
 * The endpoint answers with the share of this business's usage reports it wants. Customers differ in
 * user count by orders of magnitude, so the backend — which can see the volume — sets the rate, and
 * the client honours it without needing a release. Absent means "send everything".
 */
export const ComponentUsageAckSchema = UnwrappedDataResponseSchema(
  Schema.Struct({
    sampleRate: pipe(
      Schema.optional(Schema.NullishOr(Schema.Number)),
      Schema.fromKey('sample_rate'),
    ),
  }),
)

export type ComponentUsageAck = typeof ComponentUsageAckSchema.Type
