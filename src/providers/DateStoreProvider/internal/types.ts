import type { DateRange } from '@utils/date/dateRange'
import type { DatePreset } from '@utils/date/dateRangePresets'

/**
 * The matching date range and date preset object.
 * `preset` is `Custom` when the range does not match any named preset.
 */
export type DateRangeWithPreset = DateRange & { preset: DatePreset }

export type DateActions = {
  /** Set an explicit date range; the preset it represents is derived. */
  setDateRange: (range: DateRange, activationDate?: Date) => DateRangeWithPreset
  /** Set an explicit date preset; the concrete date range is derived. */
  setDatePreset: (datePreset: Exclude<DatePreset, DatePreset.Custom>, activationDate?: Date) => DateRangeWithPreset
  /** Set an explicit date; the date range and presetit represents is derived. */
  setDate: (date: Date, activationDate?: Date) => DateRangeWithPreset
  setMonth: (date: Date, activationDate?: Date) => DateRangeWithPreset
  setYear: (date: Date, activationDate?: Date) => DateRangeWithPreset
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }, activationDate?: Date) => DateRangeWithPreset
}

export type DateStore = DateRangeWithPreset & { actions: DateActions }
