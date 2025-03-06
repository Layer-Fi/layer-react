import { DateRangeState } from '../types'
import {
  areIntervalsOverlapping,
  endOfDay,
  endOfMonth,
  endOfYear,
  isEqual,
  min,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

/**
 * Function finds the target DateState based on the reference DateState.
 * When one is monthPicker and other is dayPicker function evaluates the target
 * to date/dateRange overlapping reference date. For instance, May 2024 -> May 1, 2024.
 */
export const resolveDateToDate = (
  refDate: DateRangeState,
  targetDate: DateRangeState,
) => {
  console.log('resolveDateToDate', refDate, targetDate)
  if (isSameMode(refDate, targetDate)) {
    console.log('isSameMode')
    return refDate
  }
  else if (areDatesOverlapping(refDate, targetDate)) {
    console.log('areDateOverlapping')
    return refDate
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

export const areDatesOverlapping = (
  { startDate: startDate1, endDate: endDate1 }: Partial<DateRangeState>,
  { startDate: startDate2, endDate: endDate2 }: Partial<DateRangeState>,
) => {
  if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
    return false
  }

  return areIntervalsOverlapping(
    { start: startDate1, end: endDate1 },
    { start: startDate2, end: endDate2 },
  )
}

/**
 * @TODO - should try to change mode if supported
 */
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
        endDate: clampToPresentOrPast(endOfDay(refDate.endDate)),
      }
    case 'monthPicker':
      return {
        ...targetDate,
        startDate: startOfMonth(refDate.startDate),
        endDate: clampToPresentOrPast(endOfMonth(refDate.startDate)),
        mode: refDate.mode,
      }
    case 'monthRangePicker':
      return {
        ...targetDate,
        startDate: startOfMonth(refDate.startDate),
        endDate: clampToPresentOrPast(endOfMonth(refDate.endDate)),
      }
    case 'yearPicker':
      return {
        ...targetDate,
        startDate: startOfYear(refDate.startDate),
        endDate: clampToPresentOrPast(endOfYear(refDate.startDate)),
        mode: targetDate.mode, // @TODO
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
        endDate: clampToPresentOrPast(endOfDay(date.endDate)),
      }
    case 'monthPicker':
      return {
        startDate: startOfMonth(date.startDate),
        endDate: clampToPresentOrPast(endOfMonth(date.startDate)),
      }
    case 'monthRangePicker':
      return {
        startDate: startOfMonth(date.startDate),
        endDate: clampToPresentOrPast(endOfMonth(date.endDate)),
      }
    case 'yearPicker':
      return {
        startDate: startOfYear(date.startDate),
        endDate: clampToPresentOrPast(endOfYear(date.startDate)),
      }
    default:
      return date
  }
}
