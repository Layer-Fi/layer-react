import type { DateRange } from '@utils/date/dateRange'
import type { DatePreset, SelectableDatePreset } from '@utils/date/dateRangePresets'

export type DateRangeWithPreset = DateRange & { preset: DatePreset }

export type DateActions = {
  /** Sets an explicit date range; the preset it represents is derived. */
  setDateRange: (options: { startDate: Date, endDate: Date }, activationDate?: Date) => DateRangeWithPreset
  /** Sets an explicit date preset; the concrete date range is derived. */
  setDatePreset: (options: { datePreset: SelectableDatePreset }, activationDate?: Date) => DateRangeWithPreset
  setDate: (options: { date: Date }, activationDate?: Date) => DateRangeWithPreset
  setMonth: (options: { startDate: Date }, activationDate?: Date) => DateRangeWithPreset
  setYear: (options: { startDate: Date }, activationDate?: Date) => DateRangeWithPreset
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }, activationDate?: Date) => DateRangeWithPreset
}

export type DateStore = DateRangeWithPreset & { actions: DateActions }
