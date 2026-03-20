import { type CalendarDate, fromDate, getLocalTimeZone, ZonedDateTime } from '@internationalized/date'
import { differenceInDays, formatISO } from 'date-fns'

import type { DateTimeFormatFn } from '@hooks/utils/i18n/useIntlFormatter'

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

export const formatCalendarDate = (date: CalendarDate, formatDate: DateTimeFormatFn): string => {
  const localDate = new Date(date.year, date.month - 1, date.day)
  return formatDate(localDate)
}
