export type DateSelectionMode = 'full' | 'month' | 'year'

export type DateRange = { startDate: Date, endDate: Date }

export type DateActions = {
  setDate: (options: { date: Date }) => DateRange
  setDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
  setMonth: (options: { startDate: Date }) => DateRange
  setYear: (options: { startDate: Date }) => DateRange
  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) => DateRange
}

export type DateStore = DateRange & { actions: DateActions }
