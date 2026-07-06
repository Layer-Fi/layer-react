import type { DateRange } from '@utils/date/dateRange'

export type DateActions = {
  setDate: (options: { date: Date }) => DateRange
  setDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
  setMonth: (options: { startDate: Date }) => DateRange
  setYear: (options: { startDate: Date }) => DateRange
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) => DateRange
}

export type DateStore = DateRange & { actions: DateActions }
