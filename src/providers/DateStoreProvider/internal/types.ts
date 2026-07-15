import type { DateRange } from '@utils/date/dateRange'
import type { DatePreset, SelectableDatePreset } from '@utils/date/dateRangePresets'

/**
 * The matching date range and date preset object.
 * `preset` is `Custom` when the range does not match any named preset.
 */
export type DateRangeWithPreset = DateRange & { preset: DatePreset }

export type DateActions = {
  /** Set an explicit date range; the preset it represents is derived. */
  setDateRange: (options: { startDate: Date, endDate: Date }, activationDate?: Date) => DateRangeWithPreset
  /** Set an explicit date preset; the concrete date range is derived. */
  setDatePreset: (options: { datePreset: SelectableDatePreset }, activationDate?: Date) => DateRangeWithPreset
  /** Set an explicit date; the date range and preset it represents are derived. */
  setDate: (options: { date: Date }, activationDate?: Date) => DateRangeWithPreset
  setMonth: (options: { startDate: Date }, activationDate?: Date) => DateRangeWithPreset
  setYear: (options: { startDate: Date }, activationDate?: Date) => DateRangeWithPreset
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }, activationDate?: Date) => DateRangeWithPreset
}

export type DateStore = DateRangeWithPreset & { actions: DateActions }
