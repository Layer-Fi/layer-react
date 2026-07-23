import { type CalendarDate, fromDate, getLocalTimeZone, toCalendarDate, type ZonedDateTime } from '@internationalized/date'
import { BigDecimal } from 'effect'

import { fromNonRecursiveBigDecimal, type NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'

export const required = (message: string) => (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? message : undefined

const toLocalCalendarDate = (date: Date) => toCalendarDate(fromDate(date, getLocalTimeZone()))

const invalidDate = (isInvalid: (date: CalendarDate) => boolean) => (message: string) => (value: ZonedDateTime | null) =>
  value !== null && isInvalid(toCalendarDate(value)) ? message : undefined

export const dateNotBefore = (minDate: Date | undefined, message: string) =>
  invalidDate(date => minDate !== undefined && date.compare(toLocalCalendarDate(minDate)) < 0)(message)

export const dateNotAfter = (maxDate: Date | undefined, message: string) =>
  invalidDate(date => maxDate !== undefined && date.compare(toLocalCalendarDate(maxDate)) > 0)(message)

export const dateNotInFuture = (message: string) => dateNotAfter(new Date(), message)

export const positiveAmount = (message: string) => (value: NonRecursiveBigDecimal | null) =>
  value !== null && BigDecimal.isPositive(fromNonRecursiveBigDecimal(value)) ? undefined : message
