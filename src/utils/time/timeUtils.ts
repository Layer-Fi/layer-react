import { differenceInDays, formatISO } from 'date-fns'
import { ZonedDateTime, fromDate, getLocalTimeZone } from '@internationalized/date'

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
