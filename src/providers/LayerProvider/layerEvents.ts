import { Schema } from 'effect'

/**
 * Public UI-event contract for Layer components, emitted via `eventCallbacks.onEvent`.
 * Adding a type or version is backwards-compatible; changing an existing (type, version)
 * payload shape is NOT — bump the version instead.
 */
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
export const TransactionsPageChangedEventV1 = LayerEventEnvelope(
  LayerEventType.TransactionsPageChanged, 1,
  { page: Schema.Number },
)
export const ReportsSectionExpandedEventV1 = LayerEventEnvelope(
  LayerEventType.ReportsSectionExpanded, 1,
  { sectionKey: Schema.String, expanded: Schema.Boolean },
)
// `reportKey` is server-defined (`ReportConfig.key`), not a static Reports.tsx tab id.
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
// `source` and `metadata` are added by the emitter. The Pick is distributed over
// the union (not `Pick<LayerEvent, ...>`) to keep type/version/payload linked.
export type LayerEventInput = LayerEvent extends infer E
  ? E extends LayerEvent ? Pick<E, 'type' | 'version' | 'payload'> : never
  : never
