import { CalendarDate } from '@internationalized/date'

const DAYS_IN_YEAR = 365

export const spreadDateAcrossYear = (
  year: number,
  index: number,
  total: number,
  days: number = DAYS_IN_YEAR,
): CalendarDate => {
  const dayOffset = Math.floor((index * days) / total)
  const date = new Date(Date.UTC(year, 0, 1 + dayOffset))

  return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}
