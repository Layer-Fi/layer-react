/**
 * The prop-usage contract, without the Effect schemas that encode it. Kept apart so that
 * `withUsageTracking` — which every public component now sits behind — does not pull `effect` and the
 * data-loading layer into the import graph of an otherwise tiny component.
 */

/**
 * The public surfaces whose props are logged on mount. Deliberately separate from
 * `LayerEventComponent`, which is exported to consumers and pinned in `src/index.test.ts`.
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

export type LoggedProp = {
  name: string
  kind: PropKind
  /** Only for `kind: 'boolean'` — the literal, so `showTitle={false}` is distinguishable. */
  booleanValue?: boolean
  /** Only for `kind: 'object'` — flattened dotted key paths, names only. */
  keys?: ReadonlyArray<string>
}

/** One component instance's props, queued at mount for the reporter to send. */
export type ComponentUsageReport = {
  businessId: string
  component: PublicComponentName
  parentComponent: PublicComponentName | null
  props: ReadonlyArray<LoggedProp>
}
