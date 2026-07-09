import type { DateRange } from '@utils/date/dateRange'
import type { DatePreset } from '@utils/date/dateRangePresets'

export type DateActions = {
  setDate: (options: { date: Date }) => DateRange
  setDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
  setMonth: (options: { startDate: Date }) => DateRange
  setYear: (options: { startDate: Date }) => DateRange
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) => DateRange
  /**
   * Set the range together with the preset it represents. The caller resolves
   * the concrete range (context-dependent presets like `AllTime` need business
   * context the store does not have), so the store just records both, keeping
   * `preset` and the range consistent.
   */
  setPresetRange: (options: { preset: DatePreset, startDate: Date, endDate: Date }) => DateRange
}

/**
 * The active preset. `Custom` means the range was set directly (e.g. from a date
 * picker) and does not correspond to a named preset. Consumers should treat the
 * range as the source of truth and `preset` as intent/label.
 */
export type DateStore = DateRange & { preset: DatePreset, actions: DateActions }
