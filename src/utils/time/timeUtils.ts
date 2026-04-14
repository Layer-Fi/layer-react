import { type CalendarDate, fromDate, getLocalTimeZone, ZonedDateTime } from '@internationalized/date'
import { differenceInDays, formatISO } from 'date-fns'

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

export const formatMinutesAsDuration = (
  totalMinutes: number,
  { compact = false }: { compact?: boolean } = {},
): string => {
  const hours = Math.trunc(totalMinutes / 60)
  const minutes = totalMinutes - hours * 60

  if (compact) {
    return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`
  }

  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}
