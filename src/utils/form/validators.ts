import { type CalendarDate, type DateValue, toCalendarDate } from '@internationalized/date'
import { BigDecimal } from 'effect'

import { fromNonRecursiveBigDecimal, type NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { convertDateToLocalCalendarDate } from '@utils/time/timeUtils'

export const required = (message: string) => (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ? message : undefined

const invalidDate = (isInvalid: (date: CalendarDate) => boolean) => (message: string) => (value: DateValue | null) =>
  value !== null && isInvalid(toCalendarDate(value)) ? message : undefined

export const dateNotBefore = (minDate: Date | undefined, message: string) =>
  invalidDate(date => minDate !== undefined && date.compare(convertDateToLocalCalendarDate(minDate)) < 0)(message)

export const dateNotAfter = (maxDate: Date | undefined, message: string) =>
  invalidDate(date => maxDate !== undefined && date.compare(convertDateToLocalCalendarDate(maxDate)) > 0)(message)

export const dateNotInFuture = (message: string) => dateNotAfter(new Date(), message)

export const positiveAmount = (message: string) => (value: NonRecursiveBigDecimal | null) =>
  value !== null && BigDecimal.isPositive(fromNonRecursiveBigDecimal(value)) ? undefined : message
