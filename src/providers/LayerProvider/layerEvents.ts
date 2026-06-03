import { Schema } from 'effect'

/** Versioned public contract for events emitted via `eventCallbacks.onEvent`. */
export const LayerEventType = {
  TaskMonthSelected: 'tasks.month_selected',
  TaskYearSelected: 'tasks.year_selected',
  TaskClicked: 'tasks.task_clicked',

  BookkeepingScheduleCallClicked: 'bookkeeping.schedule_call_clicked',

  ProfitAndLossMonthSelected: 'profit_and_loss.month_selected',

  TransactionsSearchSubmitted: 'transactions.search_submitted',
  TransactionsDownloadClicked: 'transactions.download_clicked',
  TransactionDescriptionEntered: 'transactions.description_entered',
  TransactionReceiptUploadClicked: 'transactions.receipt_upload_clicked',
  TransactionsPageChanged: 'transactions.page_changed',

  ReportsTabClicked: 'reports.tab_clicked',
  ReportsPeriodSelected: 'reports.period_selected',
  ReportsDownloadClicked: 'reports.download_clicked',
  ReportsSectionExpanded: 'reports.section_expanded',

  LinkedAccountsAddAccountClicked: 'linked_accounts.add_account_clicked',
  LinkedAccountsUnlinkAccountClicked: 'linked_accounts.unlink_account_clicked',
} as const

export type LayerEventType = (typeof LayerEventType)[keyof typeof LayerEventType]

// Public component names stamped into `metadata.component`.
export const LayerEventComponent = {
  BankTransactions: 'BankTransactions',
  Tasks: 'Tasks',
  ProfitAndLossChart: 'ProfitAndLossChart',
  BookkeepingOverview: 'BookkeepingOverview',
  UnifiedReports: 'UnifiedReports',
  LinkedAccounts: 'LinkedAccounts',
} as const

export type LayerEventComponent = (typeof LayerEventComponent)[keyof typeof LayerEventComponent]

const LayerEventComponentSchema = Schema.Literal(
  LayerEventComponent.BankTransactions,
  LayerEventComponent.Tasks,
  LayerEventComponent.ProfitAndLossChart,
  LayerEventComponent.BookkeepingOverview,
  LayerEventComponent.UnifiedReports,
  LayerEventComponent.LinkedAccounts,
)

const LayerEventMetadata = Schema.Struct({
  component: LayerEventComponentSchema,
  timestamp: Schema.String,
  packageVersion: Schema.optional(Schema.String),
})

const LayerEventEnvelope = <
  TType extends LayerEventType,
  TVersion extends number,
  TPayload extends Schema.Struct.Fields,
>(
  type: TType,
  version: TVersion,
  payload: TPayload,
) =>
  Schema.Struct({
    source: Schema.Literal('layer'),
    type: Schema.Literal(type),
    version: Schema.Literal(version),
    payload: Schema.Struct(payload),
    metadata: LayerEventMetadata,
  })

export const TaskMonthSelectedEventV1 = LayerEventEnvelope(
  LayerEventType.TaskMonthSelected, 1,
  { year: Schema.Number, month: Schema.Number },
)
export const TaskYearSelectedEventV1 = LayerEventEnvelope(
  LayerEventType.TaskYearSelected, 1,
  { year: Schema.Number },
)
export const TaskClickedEventV1 = LayerEventEnvelope(
  LayerEventType.TaskClicked, 1,
  { taskId: Schema.String },
)
export const BookkeepingScheduleCallClickedEventV1 = LayerEventEnvelope(
  LayerEventType.BookkeepingScheduleCallClicked, 1,
  {},
)
export const ProfitAndLossMonthSelectedEventV1 = LayerEventEnvelope(
  LayerEventType.ProfitAndLossMonthSelected, 1,
  { year: Schema.Number, month: Schema.Number },
)
export const TransactionsSearchSubmittedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionsSearchSubmitted, 1,
  { query: Schema.String },
)
export const TransactionsDownloadClickedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionsDownloadClicked, 1,
  {},
)
export const TransactionDescriptionEnteredEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionDescriptionEntered, 1,
  { transactionId: Schema.String },
)
export const TransactionReceiptUploadClickedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionReceiptUploadClicked, 1,
  { transactionId: Schema.String },
)
export const TransactionsPageChangedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionsPageChanged, 1,
  { page: Schema.Number },
)
// `reportKey` is server-defined (`ReportConfig.key`), not a static Reports.tsx tab id.
export const ReportsTabClickedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsTabClicked, 1,
  { reportKey: Schema.String },
)
// ISO-8601 strings; for single-date reports the range collapses to one day.
export const ReportsPeriodSelectedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsPeriodSelected, 1,
  { startDate: Schema.String, endDate: Schema.String },
)
export const ReportsDownloadClickedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsDownloadClicked, 1,
  { reportKey: Schema.String },
)
export const ReportsSectionExpandedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsSectionExpanded, 1,
  { sectionKey: Schema.String, expanded: Schema.Boolean },
)
export const LinkedAccountsAddAccountClickedEventV1 = LayerEventEnvelope(
  LayerEventType.LinkedAccountsAddAccountClicked, 1,
  {},
)
export const LinkedAccountsUnlinkAccountClickedEventV1 = LayerEventEnvelope(
  LayerEventType.LinkedAccountsUnlinkAccountClicked, 1,
  { accountId: Schema.String },
)

export const LayerEventSchema = Schema.Union(
  TaskMonthSelectedEventV1,
  TaskYearSelectedEventV1,
  TaskClickedEventV1,
  BookkeepingScheduleCallClickedEventV1,
  ProfitAndLossMonthSelectedEventV1,
  TransactionsSearchSubmittedEventV1,
  TransactionsDownloadClickedEventV1,
  TransactionDescriptionEnteredEventV1,
  TransactionReceiptUploadClickedEventV1,
  TransactionsPageChangedEventV1,
  ReportsTabClickedEventV1,
  ReportsPeriodSelectedEventV1,
  ReportsDownloadClickedEventV1,
  ReportsSectionExpandedEventV1,
  LinkedAccountsAddAccountClickedEventV1,
  LinkedAccountsUnlinkAccountClickedEventV1,
)

export type LayerEvent = typeof LayerEventSchema.Type

// Preserve type/version/payload correlation for emitter inputs.
export type LayerEventInput = LayerEvent extends infer E
  ? E extends LayerEvent ? Pick<E, 'type' | 'version' | 'payload'> : never
  : never
