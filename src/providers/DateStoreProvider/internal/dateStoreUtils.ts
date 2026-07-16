import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
} from 'date-fns'

import { clampToPresentOrPast, type DateRange, type DateSelectionMode } from '@utils/date/dateRange'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

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

export function maybeInvertDateRange(range: DateRange): DateRange {
  const { startDate, endDate } = range

  if (startDate > endDate) {
    return { startDate: endDate, endDate: startDate }
  }

  return range
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
