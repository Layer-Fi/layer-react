import { DateState } from '../types'
import {
  areIntervalsOverlapping,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns'

export const resolveDateToDate = (
  refDate: DateState,
  targetDate: DateState,
) => {
  if (isSameMode(refDate, targetDate)) {
    return refDate
  } else if (areDatesOverlapping(refDate, targetDate)) {
    return targetDate
  }

  return buildDateStateFromRefDate(refDate, targetDate)
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
