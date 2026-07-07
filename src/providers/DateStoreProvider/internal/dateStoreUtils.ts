import {
  endOfDay,
  endOfMonth,
  endOfYear,
  min,
  startOfMonth,
  startOfYear,
} from 'date-fns'

import { type DateRange, type DateSelectionMode } from '@utils/date/dateRange'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

type GetDateRangeOptions =
  | { mode: 'full', startDate: Date, endDate: Date }
  | { mode: Exclude<DateSelectionMode, 'full'>, startDate?: Date, endDate: Date }

export function getDateRange(options: GetDateRangeOptions, now: Date): DateRange {
  const cutoff = endOfDay(now)
  const mode = options.mode
  switch (mode) {
    case 'month':
      return {
        startDate: startOfMonth(options.endDate),
        endDate: min([endOfMonth(options.endDate), cutoff]),
      }
    case 'year':
      return {
        startDate: startOfYear(options.endDate),
        endDate: min([endOfYear(options.endDate), cutoff]),
      }
    case 'full':
      return {
        startDate: options.startDate,
        endDate: min([endOfDay(options.endDate), cutoff]),
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

export function getEffectiveDateForMode(mode: DateSelectionMode, { date }: { date: Date }, now: Date): { date: Date } {
  return { date: getDateRange({ mode, startDate: date, endDate: date }, now).endDate }
}

export function getEffectiveDateRangeForMode(
  mode: DateSelectionMode,
  { startDate, endDate }: { startDate: Date, endDate: Date },
  now: Date,
): { startDate: Date, endDate: Date } {
  return getDateRange({ mode, startDate, endDate }, now)
}
