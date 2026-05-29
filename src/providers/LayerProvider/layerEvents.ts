/**
 * UI event contract for Layer components.
 *
 * `LayerEvent` describes discrete frontend interactions (a click, a selection,
 * a search) that consuming apps can forward into their own analytics pipeline.
 * It is intentionally separate from server-side activity (webhooks) and from
 * the data callbacks `onTransactionCategorized` / `onTransactionsFetched`.
 *
 * Consumers subscribe via `LayerProvider`'s `eventCallbacks.onEvent`:
 *
 *   <LayerProvider eventCallbacks={{ onEvent: (event) => analytics.track(event.name, event.properties) }} />
 *
 * The union is a discriminated union keyed on `name`. Adding new members is
 * backwards-compatible; changing an existing member's `properties` is not, so
 * treat published payload shapes as stable.
 */
export type LayerEvent =
  | { name: 'tasks.month_selected', properties: { year: number, month: number } }
  | { name: 'tasks.year_selected', properties: { year: number } }
  | { name: 'tasks.task_clicked', properties: { taskId: string } }
  | { name: 'bookkeeping_overview.book_call_clicked' }
  | { name: 'profit_and_loss.month_selected', properties: { year: number, month: number } }
  | { name: 'transactions.searched', properties: { query: string } }
  | { name: 'transactions.download_clicked', properties?: { format?: string } }
  | { name: 'transactions.page_changed', properties: { page: number } }
  | { name: 'reports.tab_clicked', properties: { reportType: string } }
  | { name: 'reports.download_clicked', properties?: { reportType?: string } }
  | { name: 'reports.section_expanded', properties: { sectionKey: string, expanded: boolean } }
