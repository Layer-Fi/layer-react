import { useState } from 'react'
import { DateState } from '../types'
import { resolveDateToDate } from '../utils/date'
import { endOfMonth, isAfter, isBefore, startOfMonth } from 'date-fns'

type UseDate = (props: Partial<DateState>) => {
  date: DateState
  setDate: (date: Partial<DateState>) => boolean
}

export type UseDateProps = Partial<DateState>

export const useDate: UseDate = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  //   period: initialPeriod,
  mode: initialMode,
  supportedModes,
}: UseDateProps) => {
  const [dateState, setDateState] = useState<DateState>({
    startDate: initialStartDate ?? startOfMonth(new Date()),
    endDate: initialEndDate ?? endOfMonth(new Date()),
    // period: initialPeriod ?? 'MONTH',
    mode: initialMode ?? 'monthPicker',
    supportedModes: supportedModes ?? ['monthPicker'],
  })

  const setDate = ({
    startDate: newStartDate,
    endDate: newEndDate,
    mode: newMode,
    // period: newPeriod,
  }: Partial<DateState>) => {
    const newDate: DateState = resolveDateToDate(
      {
        startDate: newStartDate ?? dateState.startDate,
        endDate: newEndDate ?? dateState.endDate,
        // period: newPeriod ?? dateState.period,
        mode: newMode ?? dateState.mode,
        supportedModes: supportedModes ?? dateState.supportedModes,
      },
      dateState,
    )

    if (
      newDate.startDate
      && newDate.endDate
      && !isAfter(newDate.startDate, newDate.endDate)
    ) {
      setDateState(newDate)
      return true
    }

    if (
      newDate.startDate
      && !newDate.endDate
      && !isAfter(newDate.startDate, dateState.endDate)
    ) {
      setDateState(newDate)
      return true
    }

    if (
      !newDate.startDate
      && newDate.endDate
      && !isBefore(newDate.endDate, dateState.startDate)
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
