import { DatePickerMode } from '../components/DatePicker/ModeSelector/DatePickerModeSelector'
import { DateState } from '../types'
import {
  areIntervalsOverlapping,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns'
import { ta } from 'date-fns/locale'

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
    // case 'quarterPicker':
    //   return {
    //     ...targetDate,
    //     startDate: startOfQuarter(refDate.startDate),
    //     endDate: endOfQuarter(refDate.startDate),
    //   }
    // case 'quarterRangePicker':
    //   return {
    //     ...targetDate,
    //     startDate: startOfQuarter(refDate.startDate),
    //     endDate: endOfQuarter(refDate.endDate),
    //   }
    // case 'yearPicker':
    //   return {
    //     ...targetDate,
    //     startDate: startOfYear(refDate.startDate),
    //     endDate: endOfYear(refDate.startDate),
    //   }
    // case 'yearRangePicker':
    //   return {
    //     ...targetDate,
    //     startDate: startOfYear(refDate.startDate),
    //     endDate: endOfYear(refDate.endDate),
    //   }
    // case 'yearToDatePicker':
    //   return {
    //     ...targetDate,
    //     startDate: startOfYear(refDate.startDate),
    //     endDate: new Date(),
    //   }

    default:
      return targetDate
  }
}
