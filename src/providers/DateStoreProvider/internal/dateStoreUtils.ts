import {
  endOfDay,
  endOfMonth,
  endOfYear,
  max,
  min,
  startOfMonth,
  startOfYear,
} from 'date-fns'

import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import type { DateRange, DateSelectionMode } from '@providers/DateStoreProvider/internal/types'

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

type GetDateRangeOptions =
  | { mode: 'full', startDate: Date, endDate: Date }
  | { mode: Exclude<DateSelectionMode, 'full'>, startDate?: Date, endDate: Date }

export function getDateRange(options: GetDateRangeOptions): DateRange {
  const mode = options.mode
  switch (mode) {
    case 'month':
      return {
        startDate: startOfMonth(options.endDate),
        endDate: clampToPresentOrPast(endOfMonth(options.endDate)),
      }
    case 'year':
      return {
        startDate: startOfYear(options.endDate),
        endDate: clampToPresentOrPast(endOfYear(options.endDate)),
      }
    case 'full':
      return {
        startDate: options.startDate,
        endDate: clampToPresentOrPast(endOfDay(options.endDate)),
      }
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid mode',
      })
  }
}

export function withCorrectedRange<TDateRange extends DateRange, TOut>(fn: (options: TDateRange) => TOut) {
  return (options: TDateRange) => {
    const { startDate, endDate } = options

    if (startDate > endDate) {
      return fn({ ...options, startDate: endDate, endDate: startDate })
    }

    return fn({ ...options, startDate, endDate })
  }
}

export function getEffectiveDateForMode(mode: DateSelectionMode, { date }: { date: Date }): { date: Date } {
  return { date: getDateRange({ mode, startDate: date, endDate: date }).endDate }
}

export function getEffectiveDateRangeForMode(
  mode: DateSelectionMode,
  { startDate, endDate }: { startDate: Date, endDate: Date },
): { startDate: Date, endDate: Date } {
  return getDateRange({ mode, startDate, endDate })
}
