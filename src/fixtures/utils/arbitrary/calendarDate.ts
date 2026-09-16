import { CalendarDate } from '@internationalized/date'
import { type FastCheck } from 'effect'

export const calendarDateArbitrary = (year: number) => (fc: typeof FastCheck) =>
  fc.date({
    min: new Date(Date.UTC(year, 0, 1)),
    max: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
    noInvalidDate: true,
  }).map(date => new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()))
