import { type CalendarDate, fromDate, getLocalTimeZone, ZonedDateTime } from '@internationalized/date'
import { differenceInDays, formatISO } from 'date-fns'
import { DateTime } from 'effect'

import type { DateFormatFn } from '@utils/i18n/date/formatters'

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

export const formatCalendarDate = (date: CalendarDate, formatDate: DateFormatFn): string => {
  const localDate = new Date(date.year, date.month - 1, date.day)
  return formatDate(localDate)
}

export const formatDateTimeUtc = (
  dt: DateTime.Utc,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }
  const formatter = new DateFormatter('en-US', { ...defaultOptions, ...options })
  const parts = DateTime.toPartsUtc(dt)
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  return formatter.format(utcDate)
}
