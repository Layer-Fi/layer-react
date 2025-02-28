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

  const resolvedDate = resolveDateToDate({
    startDate: globalStartDate,
    endDate: globalEndDate,
    mode: globalMode,
  }, initialVal)

  const castedDate = castDateRangeToMode(resolvedDate)

  const finalDate = { ...resolvedDate, ...castedDate }

  // Set initial state from global date, props or default to current month
  const [dateState, setDateState] = useState<DateRangeState>(finalDate)

  // Sync to global date state
  useEffect(() => {
    if (syncWithGlobalDate) {
      if (areDateRangesEqual(dateState, { startDate: globalStartDate, endDate: globalEndDate })) {
        // Dates are the same, no need to update global state
        return
      }
      else {
        // Dates are different, update global state
        setGlobalDate({
          startDate: dateState.startDate,
          endDate: dateState.endDate,
          mode: dateState.mode,
        })
      }
    }

    // Call onChange to update component state
    onChange?.(dateState) // Trick with ref?
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateState])

  // Sync from global date state
  useEffect(() => {
    if (syncWithGlobalDate) {
      if (areDateRangesEqual(dateState, { startDate: globalStartDate, endDate: globalEndDate })) {
        // Dates are the same, no need to update local state
        return
      }

      if (areDatesOverlapping(dateState, { startDate: globalStartDate, endDate: globalEndDate })) {
        // Dates are overlapping - no need to update local state
        return
      }

      // Dates are different, update local state
      const newDate: DateRangeState = resolveDateToDate(
        {
          startDate: globalStartDate ?? dateState.startDate,
          endDate: globalEndDate ?? dateState.endDate,
          mode: dateState.mode, // @TODO - change local mode if new mode is included in allowedModes
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
