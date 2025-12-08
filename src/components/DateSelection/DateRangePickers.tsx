import { useEffect } from 'react'

import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { HStack } from '@ui/Stack/Stack'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'

type DateRangePickersProps = {
  minDate?: Date | null
  maxDate?: Date | null
}

export const DateRangePickers = ({ minDate, maxDate }: DateRangePickersProps) => {
  const { startDate: globalStartDate, endDate: globalEndDate } = useGlobalDateRange({ displayMode: 'full' })
  const { setDateRange: setGlobalDateRange } = useGlobalDateRangeActions()

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
    <HStack gap='md' pb='md'>
      <DatePicker
        label='Start Date'
        showLabel={true}
        date={localStartDate}
        onChange={onChangeStartDate}
        minDate={minStartDate}
        maxDate={maxStartDate}
        isInvalid={startDateInvalid}
        errorText={startDateErrorText}
        onBlur={onBlurStartDate}
      />
      <DatePicker
        label='End Date'
        showLabel={true}
        date={localEndDate}
        onChange={onChangeEndDate}
        minDate={minEndDate}
        maxDate={maxEndDate}
        isInvalid={endDateInvalid}
        errorText={endDateErrorText}
        onBlur={onBlurEndDate}
      />
    </HStack>
  )
}
