import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
} from 'date-fns'

import { type DateRange, type DateSelectionMode } from '@utils/date/dateRange'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'

type GetDateRangeOptions =
  | { mode: 'full', startDate: Date, endDate: Date }
  | { mode: Exclude<DateSelectionMode, 'full'>, startDate?: Date, endDate: Date }

export function getDateRange({ mode, startDate, endDate }: GetDateRangeOptions): DateRange {
  switch (mode) {
    case 'month':
      return {
        startDate: startOfMonth(endDate),
        endDate: endOfMonth(endDate),
      }
    case 'year':
      return {
        startDate: startOfYear(endDate),
        endDate: endOfYear(endDate),
      }
    case 'full':
      return {
        startDate: startDate,
        endDate: endOfDay(endDate),
      }
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid mode',
      })
  }
}

export function correctDateRange({ startDate, endDate }: DateRange): DateRange {
  if (startDate > endDate) {
    return { startDate: endDate, endDate: startDate }
  }

  return { startDate, endDate }
}

export function getEffectiveDateForMode(mode: DateSelectionMode, { date }: { date: Date }): { date: Date } {
  return { date: getDateRange({ mode, startDate: date, endDate: date }).endDate }
}

export function getEffectiveDateRangeForMode(
  mode: DateSelectionMode,
  { startDate, endDate }: DateRange,
): DateRange {
  return getDateRange({ mode, startDate, endDate })
}
