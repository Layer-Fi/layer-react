import { DateRangeState } from '../types'
import {
  areIntervalsOverlapping,
  endOfDay,
  endOfMonth,
  endOfYear,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

/**
 * Function finds the target DateState based on the reference DateState.
 * When one is monthPicker and other is dayPicker function evaluates the target
 * to date/dateRange overlapping reference date. For instance, May 2024 -> May 1, 2024.
 */
export const resolveDateToDate = (
  refDate: DateRangeState,
  targetDate: DateRangeState,
) => {
  if (isSameMode(refDate, targetDate)) {
    return refDate
  }
  else if (areDatesOverlapping(refDate, targetDate)) {
    return targetDate
  }

  return buildDateRangeStateFromRefDate(refDate, targetDate)
}

export const areDateRangesEqual = (
  { startDate: startDate1, endDate: endDate1 }: Partial<DateRangeState>,
  { startDate: startDate2, endDate: endDate2 }: Partial<DateRangeState>,
) => {
  if (!startDate1 || !startDate2 || !endDate1 || !endDate2) {
    return false
  }

  return isEqual(startOfDay(startDate1), startOfDay(startDate2))
    && isEqual(endOfDay(endDate1), endOfDay(endDate2))
}

const isSameMode = ({ mode: mode1 }: DateRangeState, { mode: mode2 }: DateRangeState) =>
  mode1 === mode2

const areDatesOverlapping = (
  { startDate: startDate1, endDate: endDate1 }: DateRangeState,
  { startDate: startDate2, endDate: endDate2 }: DateRangeState,
) => {
  return areIntervalsOverlapping(
    { start: startDate1, end: endDate1 },
    { start: startDate2, end: endDate2 },
  )
}

const buildDateRangeStateFromRefDate = (
  refDate: DateRangeState,
  targetDate: DateRangeState,
) => {
  switch (targetDate.mode) {
    case 'dayPicker':
      return {
        ...targetDate,
        startDate: startOfDay(refDate.startDate),
        endDate: endOfDay(refDate.startDate),
      }
    case 'dayRangePicker':
      return {
        ...targetDate,
        startDate: startOfDay(refDate.startDate),
        endDate: endOfDay(refDate.endDate),
      }
    case 'monthPicker':
      return {
        ...targetDate,
        startDate: startOfMonth(refDate.startDate),
        endDate: endOfMonth(refDate.startDate),
      }
    case 'monthRangePicker':
      return {
        ...targetDate,
        startDate: startOfMonth(refDate.startDate),
        endDate: endOfMonth(refDate.endDate),
      }
    case 'yearPicker':
      return {
        ...targetDate,
        startDate: startOfYear(refDate.startDate),
        endDate: endOfYear(refDate.startDate),
      }
    default:
      return targetDate
  }
}

export const castDateRangeToMode = (
  date: DateRangeState,
) => {
  switch (date.mode) {
    case 'dayPicker':
      return {
        startDate: startOfDay(date.startDate),
        endDate: endOfDay(date.startDate),
      }
    case 'dayRangePicker':
      return {
        startDate: startOfDay(date.startDate),
        endDate: endOfDay(date.endDate),
      }
    case 'monthPicker':
      return {
        startDate: startOfMonth(date.startDate),
        endDate: endOfMonth(date.startDate),
      }
    case 'monthRangePicker':
      return {
        startDate: startOfMonth(date.startDate),
        endDate: endOfMonth(date.endDate),
      }
    case 'yearPicker':
      return {
        startDate: startOfYear(date.startDate),
        endDate: endOfYear(date.startDate),
      }
    default:
      return date
  }
}
