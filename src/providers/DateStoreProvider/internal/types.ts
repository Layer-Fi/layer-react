import type { DateRange } from '@utils/date/dateRange'
import type { DatePreset } from '@utils/date/dateRangePresets'

/**
 * The selected range together with the preset it represents. `preset` is `Custom`
 * when the range was set to something that matches no named preset.
 */
export type DateRangeWithPreset = DateRange & { preset: DatePreset }

/**
 * `activationDate` is injected by the hooks so `AllTime` can resolve/derive; the
 * store itself stays context-free.
 */
export type DateActions = {
  setDate: (options: { date: Date }, activationDate?: Date) => DateRangeWithPreset
  /** Set an explicit range; the preset it represents is derived. */
  setDateRange: (range: DateRange, activationDate?: Date) => DateRangeWithPreset
  /** Set by preset; the concrete range is resolved. */
  setDatePreset: (datePreset: Exclude<DatePreset, DatePreset.Custom>, activationDate?: Date) => DateRangeWithPreset
  setMonth: (options: { startDate: Date }, activationDate?: Date) => DateRangeWithPreset
  setYear: (options: { startDate: Date }, activationDate?: Date) => DateRangeWithPreset
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }, activationDate?: Date) => DateRangeWithPreset
}

export type DateStore = DateRangeWithPreset & { actions: DateActions }
