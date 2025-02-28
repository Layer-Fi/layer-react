import { useEffect, useState } from 'react'
import { DateRangeState } from '../types'
import { areDateRangesEqual, areDatesOverlapping, castDateRangeToMode, clampToPresentOrPast, resolveDateToDate } from '../utils/date'
import { endOfMonth, isAfter, isBefore, startOfMonth } from 'date-fns'
import { useGlobalDate, useGlobalDateActions } from '../providers/GlobalDateStore/GlobalDateStoreProvider'

export type UseDateRangeProps = Partial<DateRangeState> & {
  syncWithGlobalDate?: boolean
  onChange?: (date: DateRangeState) => void
}

type UseDateRange = (props: UseDateRangeProps) => {
  date: DateRangeState
  setDate: (date: Partial<DateRangeState>) => boolean
}

export const useDateRange: UseDateRange = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  mode: initialMode,
  supportedModes,
  syncWithGlobalDate,
  onChange,
}: UseDateRangeProps) => {
  const { startDate: globalStartDate, endDate: globalEndDate, mode: globalMode } = useGlobalDate()
  const { setDate: setGlobalDate } = useGlobalDateActions()

  const initialVal = {
    startDate: syncWithGlobalDate
      ? globalStartDate
      : clampToPresentOrPast(initialStartDate ?? startOfMonth(new Date())),
    endDate: syncWithGlobalDate
      ? globalEndDate
      : clampToPresentOrPast(initialEndDate ?? endOfMonth(new Date())),
    mode: initialMode ?? 'monthPicker',
    supportedModes: supportedModes ?? ['monthPicker'],
  }

  // console.log('initialVal UE3',
  //   initialVal,
  //   { initialStartDate, initialEndDate, initialMode },
  //   { globalStartDate, globalEndDate, globalMode },
  //   castDateRangeToMode(
  //     { startDate: initialVal.startDate, endDate: initialVal.endDate, mode: initialVal.mode },
  //   ))

  const resolvedDate = resolveDateToDate({
    startDate: globalStartDate,
    endDate: globalEndDate,
    mode: globalMode,
  }, initialVal)

  const castedDate = castDateRangeToMode(resolvedDate)

  const finalDate = { ...resolvedDate, ...castedDate }

  // Set initial state from global date, props or default to current month
  const [dateState, setDateState] = useState<DateRangeState>(finalDate)

  // Disable circular global date update when setting `date` from global date
  // const [readingFromGlobal, setReadingFromGlobal] = useState(false)

  // Sync to global date state
  useEffect(() => {
    if (syncWithGlobalDate) {
      if (areDateRangesEqual(dateState, { startDate: globalStartDate, endDate: globalEndDate })) {
        // console.log('Sync to global - date are the same', resolvedDate, castedDate, finalDate, dateState)
        console.log('Sync to global - date are the same')
        return
      }
      else {
        console.log('Sync to global - date are NOT the same', 'global', { globalStartDate, globalEndDate }, 'local', dateState)
        // console.log('Sync to global - date are NOT the same')
        setGlobalDate({
          startDate: dateState.startDate,
          endDate: dateState.endDate,
          mode: dateState.mode,
        })
      }
    }

    console.log('useDateRange -> call onChange to update local cmp state', dateState)
    onChange?.(dateState) // Trick with ref?
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateState])

  // Sync from global date state
  useEffect(() => {
    if (syncWithGlobalDate) {
      if (areDateRangesEqual(dateState, { startDate: globalStartDate, endDate: globalEndDate })) {
        console.log('Sync from global - date are the same (equal)')
        return
      }

      if (areDatesOverlapping(dateState, { startDate: globalStartDate, endDate: globalEndDate })) {
        console.log('Sync from global - date are the same (overlapping)')
        return
      }

      console.log('Sync from global - date are NOT the same', 'global', { globalStartDate, globalEndDate }, 'local', dateState.startDate)
      // console.log('Sync from global - date are NOT the same')
      const newDate: DateRangeState = resolveDateToDate(
        {
          startDate: globalStartDate ?? dateState.startDate,
          endDate: globalEndDate ?? dateState.endDate,
          mode: dateState.mode, // @TODO - consider changing also local mode
        },
        dateState,
      )

      setDate(newDate)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalStartDate, globalEndDate])

  // Update the internal date state and resolve all cases like start after end.
  const setDate = ({
    startDate: newStartDate,
    endDate: newEndDate,
    mode: newMode,
    // period: newPeriod,
  }: Partial<DateRangeState>) => {
    const newDate: DateRangeState = resolveDateToDate(
      {
        startDate: newStartDate ?? dateState.startDate,
        endDate: newEndDate ?? dateState.endDate,
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
