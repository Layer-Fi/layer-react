import { useEffect } from 'react'

import { useGlobalDatePickerBounds } from '@hooks/useGlobalDatePickerBounds/useGlobalDatePickerBounds'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'

export const GlobalDateRangePicker = ({ showLabels = false }: { showLabels?: boolean }) => {
  const { startDate: globalStartDate, endDate: globalEndDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange: setGlobalDateRange } = useGlobalDateRangeActions()
  const { minDate, maxDate } = useGlobalDatePickerBounds()

  const {
    localDate: localStartDate,
    onChange: onChangeStartDate,
    minDateZdt: minStartDate,
    maxDateZdt: maxStartDate,
    isInvalid: startDateInvalid,
    errorText: startDateErrorText,
    onBlur: onBlurStartDate,
  } = useDatePickerState({
    date: globalStartDate,
    minDate,
    maxDate,
  })

  const {
    localDate: localEndDate,
    onChange: onChangeEndDate,
    minDateZdt: minEndDate,
    maxDateZdt: maxEndDate,
    isInvalid: endDateInvalid,
    errorText: endDateErrorText,
    onBlur: onBlurEndDate,
  } = useDatePickerState({
    date: globalEndDate,
    minDate,
    maxDate,
  })

  useEffect(() => {
    if (startDateInvalid || endDateInvalid || !localStartDate || !localEndDate) return

    const next = { startDate: localStartDate.toDate(), endDate: localEndDate.toDate() }

    setGlobalDateRange(next)
  }, [startDateInvalid, endDateInvalid, localStartDate, localEndDate, setGlobalDateRange])

  return (
    <>
      <DatePicker
        label='Start date'
        date={localStartDate}
        onChange={onChangeStartDate}
        minDate={minStartDate}
        maxDate={maxStartDate}
        isInvalid={startDateInvalid}
        errorText={startDateErrorText}
        onBlur={onBlurStartDate}
        slotProps={{ Label: { size: 'sm', pbe: '3xs' } }}
        showLabel={showLabels}
      />
      <DatePicker
        label='End date'
        date={localEndDate}
        onChange={onChangeEndDate}
        minDate={minEndDate}
        maxDate={maxEndDate}
        isInvalid={endDateInvalid}
        errorText={endDateErrorText}
        onBlur={onBlurEndDate}
        slotProps={{ Label: { size: 'sm', pbe: '3xs' } }}
        showLabel={showLabels}
      />
    </>
  )
}
