import { Schema } from 'effect'

/**
 * Public UI-event contract for Layer components.
 *
 * Every supported frontend interaction inside embedded Layer components is emitted through
 * `eventCallbacks.onEvent` as a versioned envelope. Adding a new event type or a new envelope
 * version is backwards-compatible; changing an existing (type, version) payload shape is NOT —
 * bump the version instead.
 */

// Runtime constants + precise string union of every supported event type.
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

const LayerEventMetadata = Schema.Struct({
  component: Schema.String,
  timestamp: Schema.String,
  packageVersion: Schema.optional(Schema.String),
})

// Generic envelope factory: one concrete schema per (type, version, payload).
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

// ---- Migrated events (currently emitted) ----
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
export const TransactionsPageChangedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionsPageChanged, 1,
  { page: Schema.Number },
)
export const ReportsSectionExpandedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsSectionExpanded, 1,
  { sectionKey: Schema.String, expanded: Schema.Boolean },
)

// ---- Defined-but-unemitted events (follow-up PRs will wire these) ----
export const TransactionsDownloadClickedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionsDownloadClicked, 1,
  { format: Schema.optional(Schema.String) },
)
export const TransactionDescriptionEnteredEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionDescriptionEntered, 1,
  { transactionId: Schema.String },
)
export const TransactionReceiptUploadClickedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionReceiptUploadClicked, 1,
  { transactionId: Schema.String },
)
// `tab` is a free-form report key: the UnifiedReports surface is server-config driven
// (`ReportConfig.key`), not limited to the static Reports.tsx tab identifiers, so this is a
// plain string rather than a literal union — a strict union would silently drop real events.
export const ReportsTabClickedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsTabClicked, 1,
  { tab: Schema.String },
)
export const ReportsPeriodSelectedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsPeriodSelected, 1,
  { period: Schema.String },
)
export const ReportsDownloadClickedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsDownloadClicked, 1,
  { reportType: Schema.optional(Schema.String) },
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
  TransactionsPageChangedEventV1,
  ReportsSectionExpandedEventV1,
  TransactionsDownloadClickedEventV1,
  TransactionDescriptionEnteredEventV1,
  TransactionReceiptUploadClickedEventV1,
  ReportsTabClickedEventV1,
  ReportsPeriodSelectedEventV1,
  ReportsDownloadClickedEventV1,
  LinkedAccountsAddAccountClickedEventV1,
  LinkedAccountsUnlinkAccountClickedEventV1,
)

export type LayerEvent = typeof LayerEventSchema.Type

// Input accepted by the centralized emitter: type + version + payload only.
// `source` and `metadata` are added by the emitter.
export type LayerEventInput = Pick<LayerEvent, 'type' | 'version' | 'payload'>
