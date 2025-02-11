import { DateState } from '../types'
import {
  areIntervalsOverlapping,
  endOfDay,
  endOfMonth,
  isEqual,
  startOfDay,
  startOfMonth,
} from 'date-fns'

/**
 * Function finds the target DateState based on the reference DateState.
 * When one is monthPicker and other is dayPicker function evaluates the target
 * to date/dateRange overlapping reference date. For instance, May 2024 -> May 1, 2024.
 */
export const resolveDateToDate = (
  refDate: DateState,
  targetDate: DateState,
) => {
  if (isSameMode(refDate, targetDate)) {
    return refDate
  }
  else if (areDatesOverlapping(refDate, targetDate)) {
    return targetDate
  }

  return buildDateStateFromRefDate(refDate, targetDate)
}

export const areDateRangesEqual = (
  { startDate: startDate1, endDate: endDate1 }: Partial<DateState>,
  { startDate: startDate2, endDate: endDate2 }: Partial<DateState>,
) => {
  if (!startDate1 || !startDate2 || !endDate1 || !endDate2) {
    return false
  }

  return isEqual(startDate1, startDate2) && isEqual(endDate1, endDate2)
}

const isSameMode = ({ mode: mode1 }: DateState, { mode: mode2 }: DateState) =>
  mode1 === mode2

const areDatesOverlapping = (
  { startDate: startDate1, endDate: endDate1 }: DateState,
  { startDate: startDate2, endDate: endDate2 }: DateState,
) => {
  return areIntervalsOverlapping(
    { start: startDate1, end: endDate1 },
    { start: startDate2, end: endDate2 },
  )
}

const buildDateStateFromRefDate = (
  refDate: DateState,
  targetDate: DateState,
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
    default:
      return targetDate
  }
}
