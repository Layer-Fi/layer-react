import { useState } from 'react'
import { DEFAULT_ALLOWED_PICKER_MODES } from '../../components/DatePicker/ModeSelector/DatePickerModeSelector'
import { DateState } from '../../types'
import { resolveDateToDate } from '../../utils/date'
import { endOfMonth, isAfter, isBefore, startOfMonth } from 'date-fns'

type UseDate = (props: Partial<DateState>) => {
  date: DateState
  setDate: (date: Partial<DateState>) => boolean
}

export type UseDateProps = Partial<DateState>

/**
 * @TODO handle period
 */
export const useDate: UseDate = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  period: initialPeriod,
  mode: initialMode,
  supportedModes,
  name, // @TODO - only for logging and testing
}: UseDateProps) => {
  const [dateState, setDateState] = useState<DateState>({
    startDate: initialStartDate ?? startOfMonth(new Date()),
    endDate: initialEndDate ?? endOfMonth(new Date()),
    period: initialPeriod ?? 'MONTH',
    mode: initialMode ?? 'monthPicker',
    supportedModes: supportedModes ?? ['monthPicker'], // @TODO - use sth more generic and default
  })

  const setDate = ({
    startDate: newStartDate,
    endDate: newEndDate,
    mode: newMode,
    period: newPeriod,
  }: Partial<DateState>) => {
    let newDate: DateState = resolveDateToDate(
      {
        startDate: newStartDate ?? dateState.startDate,
        endDate: newEndDate ?? dateState.endDate,
        period: newPeriod ?? dateState.period,
        mode: newMode ?? dateState.mode,
        supportedModes: supportedModes ?? dateState.supportedModes,
      },
      dateState,
    )

    console.log(
      'flagXX',
      name,
      {
        startDate: newStartDate ?? dateState.startDate,
        endDate: newEndDate ?? dateState.endDate,
        period: newPeriod ?? dateState.period,
        mode: newMode ?? dateState.mode,
        supportedModes: supportedModes ?? dateState.supportedModes,
      },
      dateState,
      newDate,
    )

    if (
      newDate.startDate &&
      newDate.endDate &&
      !isAfter(newDate.startDate, newDate.endDate)
    ) {
      setDateState(newDate)
      return true
    }

    if (
      newDate.startDate &&
      !newDate.endDate &&
      !isAfter(newDate.startDate, dateState.endDate)
    ) {
      setDateState(newDate)
      return true
    }

    if (
      !newDate.startDate &&
      newDate.endDate &&
      !isBefore(newDate.endDate, dateState.startDate)
    ) {
      setDateState(newDate)
      return true
    }

    return false
  }

  return {
    date: dateState,
    setDate: setDate,
  }
}
