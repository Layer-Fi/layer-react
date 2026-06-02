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
  TransactionsPageChanged: 'transactions.page_changed',

  ReportsTabClicked: 'reports.tab_clicked',
  ReportsSectionExpanded: 'reports.section_expanded',
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
// `reportKey` is server-defined: the UnifiedReports surface is driven by `ReportConfig.key`,
// not limited to static Reports.tsx tab identifiers.
export const ReportsTabClickedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsTabClicked, 1,
  { reportKey: Schema.String },
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
  ReportsTabClickedEventV1,
)

export type LayerEvent = typeof LayerEventSchema.Type

// Input accepted by the centralized emitter: type + version + payload only.
// `source` and `metadata` are added by the emitter.
// Distribute the Pick over the union so the (type, version, payload) discriminated
// link is preserved — otherwise mismatched payloads would type-check and only fail
// at runtime validation.
export type LayerEventInput = LayerEvent extends infer E
  ? E extends LayerEvent ? Pick<E, 'type' | 'version' | 'payload'> : never
  : never
