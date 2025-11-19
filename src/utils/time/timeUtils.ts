import { type CalendarDate, DateFormatter, fromDate, getLocalTimeZone, ZonedDateTime } from '@internationalized/date'
import { differenceInDays, formatISO } from 'date-fns'

export const toLocalDateString = (date: Date): string => formatISO(date.valueOf(), { representation: 'date' })

export function getDueDifference(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const normalizedDue = new Date(dueDate)
  normalizedDue.setHours(0, 0, 0, 0)

  return differenceInDays(normalizedDue, today)
}

export function isZonedDateTime(val: unknown): val is ZonedDateTime {
  return val instanceof ZonedDateTime
}

export const convertDateToZonedDateTime = (date: Date) => fromDate(date, getLocalTimeZone())

export const formatCalendarDate = (date: CalendarDate): string => {
  const formatter = new DateFormatter('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  // Create a Date object in UTC to avoid timezone shifts
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day))
  return formatter.format(utcDate)
}
