import { useEffect, useMemo, useState } from 'react'
import { endOfDay, endOfMonth, endOfYear } from 'date-fns'
import { DatePickerProps } from './types'
import { isRangeMode } from './utils'
import { useDateRange } from '../../hooks/useDateRange'
import { DatePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export function useDatePickerState({
  selected: initialSelected,
  defaultSelected,
  onChange,
  displayMode = 'dayPicker',
  allowedModes,
  minDate,
  maxDate,
  syncWithGlobalDate,
}: Pick<DatePickerProps,
'selected'
| 'defaultSelected'
| 'onChange'
| 'displayMode'
| 'allowedModes'
| 'minDate'
| 'maxDate'
| 'syncWithGlobalDate'
>) {
  const selected = initialSelected ?? defaultSelected

  const initialVal = {
    startDate: selected && selected instanceof Date
      ? selected
      : selected && (selected as [Date, Date])[0] ? (selected as [Date, Date])[0] : new Date(),
    endDate: selected && selected instanceof Date
      ? selected
      : selected && (selected as [Date, Date])[1]
        ? (selected as [Date, Date])[1]
        : endOfDay(new Date()),
    mode: displayMode as DatePickerMode, // @TODO - unsafe - it doesn't handle TimePicker
    syncWithGlobalDate,
  }

  const { date, setDate } = useDateRange(initialVal)

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

    if (selected instanceof Date) {
      setStartDate(selected)
    }
  }, [displayMode, selected])

  useEffect(() => {
    if (
      selectingInternalDates === false
      && startDate
      && endDate
      && JSON.stringify({ s: date.startDate, e: date.endDate })
      !== JSON.stringify({ s: startDate, e: endDate })
    ) {
      // @TODO - enable this
      // setDate({ startDate, endDate })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectingInternalDates])

  useEffect(() => {
    // @TODO - dayPicker still could be a range?
    if (displayMode === 'dayPicker' || displayMode === 'timePicker') {
      onChange?.(date.startDate)
    }
    else {
      onChange?.([date.startDate, date.endDate])
    }
  }, [date, onChange, displayMode])

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
