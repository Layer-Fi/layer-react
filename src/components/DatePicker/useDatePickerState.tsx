import { useEffect, useMemo, useRef, useState } from 'react'

import { endOfDay, endOfMonth, endOfYear } from 'date-fns'
import { useGlobalDate, useGlobalDateActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDateContext } from '../../contexts/DateContext'
import { DatePickerProps } from './types'
import { isRangeMode } from './utils'
import { DateState } from '../../types'
import { areDateRangesEqual } from '../../utils/date'
import { formatDate } from '../../utils/format'

export function useDatePickerState({
  selected,
  onChange,
  displayMode = 'dayPicker',
  allowedModes,
  minDate,
  maxDate,
  syncWithGlobalDate,
}: Pick<DatePickerProps,
'selected'
| 'onChange'
| 'displayMode'
| 'allowedModes'
| 'minDate'
| 'maxDate'
| 'syncWithGlobalDate'
>) {
  // To track prev vs new value in the useEffect
  const dateRef = useRef<DateState | null>(null)

  const { startDate: globalStartDate, endDate: globalEndDate } = useGlobalDate()
  const { setDate: setGlobalDate } = useGlobalDateActions()
  const globalDateRange = { startDate: globalStartDate, endDate: globalEndDate }
  const { date, setDate } = useDateContext()

  // Disable circular global date update when setting `date` from global date
  const [readingFromGlobal, setReadingFromGlobal] = useState(false)

  const [selectingInternalDates, setSelectingInternalDates] = useState<boolean>(false)

  const [startDate, setStartDate] = useState<Date | null>(
    date.startDate ?? new Date(),
  )
  const [endDate, setEndDate] = useState<Date | null>(
    date.endDate ?? endOfDay(new Date()),
  )

  const pickerMode = useMemo(() => {
    if (!allowedModes) {
      return displayMode
    }

    if (displayMode === 'timePicker') {
      return displayMode
    }

    if (allowedModes.includes(displayMode)) {
      return displayMode
    }

    return allowedModes[0] ?? displayMode
  }, [displayMode, allowedModes])

  useEffect(() => {
    console.log('UE 1 - selected')
    if (!selected) {
      return
    }

    if (isRangeMode(displayMode) && Array.isArray(selected)) {
      if ((selected as [Date, Date])[0]) {
        setStartDate((selected as [Date, Date])[0])
      }
      if ((selected as [Date, Date])[1]) {
        setEndDate((selected as [Date, Date])[1])
      }
      return
    }

    setStartDate(selected as Date)
  }, [displayMode, selected])

  useEffect(() => {
    console.log('UE 2 - selectingDates')
    if (
      selectingInternalDates === false
      && startDate
      && endDate
      && JSON.stringify({ s: date.startDate, e: date.endDate })
      !== JSON.stringify({ s: startDate, e: endDate })
    ) {
      setDate({ startDate, endDate })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectingInternalDates])

  useEffect(() => {
    console.log('UE 3 - date')
    // Ignore hook when prev and new values are actually the same,
    // but because both are objects, useEffect doesn't recognize them as equal
    if (JSON.stringify(dateRef.current) === JSON.stringify(date)) {
      setReadingFromGlobal(false)
      return
    }

    if (
      syncWithGlobalDate
      && date.startDate
      && date.endDate
      && JSON.stringify({ s: date.startDate, e: date.endDate })
      !== JSON.stringify({
        s: globalDateRange.startDate,
        e: globalDateRange.endDate,
      })
    ) {
      // Ignore updating global state after setting local date from global date
      if (!readingFromGlobal) {
        setGlobalDate({
          startDate: date.startDate,
          endDate: date.endDate,
        })
      }
    }

    if (startDate !== date.startDate) {
      setStartDate(date.startDate)
    }

    if (endDate !== date.endDate) {
      setEndDate(date.endDate)
    }

    if (onChange) {
      if (isRangeMode(displayMode)) {
        onChange([date.startDate, date.endDate])
      }
      else {
        onChange(date.startDate)
      }
    }

    dateRef.current = date

    // Clear the safety flag
    setReadingFromGlobal(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => {
    if (
      syncWithGlobalDate
      && globalDateRange.startDate
      && globalDateRange.endDate
      && (!date || (date && !areDateRangesEqual(globalDateRange, date)))
    ) {
      console.log('UE 4 - globalDateRange', areDateRangesEqual(globalDateRange, date))
      // Set this flag to stop propagating local date update into global date
      // in the next useEffect(() => {...}, [date]) - to avoid circular hooks runs
      setReadingFromGlobal(true)

      setDate({
        startDate: globalDateRange.startDate,
        endDate: globalDateRange.endDate,
      })

      setStartDate(globalDateRange.startDate)
      setEndDate(globalDateRange.endDate)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDateRange])

  //   console.log('global', formatDate(globalDateRange.startDate), formatDate(globalDateRange.endDate), 'local', formatDate(date.startDate), formatDate(date.endDate))

  console.log('global date', formatDate(globalStartDate), formatDate(globalEndDate))

  const isCurrentDate = () => {
    const currentDate = new Date()

    switch (pickerMode) {
      case 'dayPicker':
        return startDate?.toDateString() === currentDate.toDateString()
      case 'monthPicker':
        return (
          startDate?.getMonth() === currentDate.getMonth()
          && startDate?.getFullYear() === currentDate.getFullYear()
        )
      case 'yearPicker':
        return startDate?.getFullYear() === currentDate.getFullYear()
      default:
        return false
    }
  }

  const setCurrentDate = () => {
    const currentDate = new Date()

    switch (pickerMode) {
      case 'dayPicker':
        onChange?.(currentDate)
        break
      case 'monthPicker':
        onChange?.(currentDate)
        break
      case 'yearPicker':
        onChange?.(currentDate)
        break
      default:
        break
    }
  }

  const isTodayOrAfter = useMemo(() => {
    if (!startDate) {
      return false
    }

    switch (displayMode) {
      case 'dayPicker':
        return startDate >= endOfDay(new Date()) || (maxDate && startDate >= maxDate)
      case 'monthPicker':
        return (
          endOfMonth(startDate) >= endOfMonth(new Date())
          || (maxDate && endOfMonth(startDate) >= maxDate)
        )
      case 'yearPicker':
        return (
          endOfYear(startDate) >= endOfYear(new Date())
          || (maxDate && endOfYear(startDate) >= maxDate)
        )
      default:
        return false
    }
  }, [startDate, maxDate, displayMode])

  const isBeforeMinDate = Boolean(minDate && startDate && startDate <= minDate)

  return {
    setDate,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setSelectingInternalDates,
    isTodayOrAfter,
    isBeforeMinDate,
    isCurrentDate,
    setCurrentDate,
    pickerMode,
  }
}
