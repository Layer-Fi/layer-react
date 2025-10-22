import { HStack } from '../ui/Stack/Stack'
import { DateSelectionComboBox } from './DateSelectionComboBox'
import { DatePicker } from '../DatePicker/DatePicker'
import { useGlobalDateRange, useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDatePickerState } from '../DatePicker/useDatePickerState'
import { useEffect } from 'react'
import './dateRangeSelection.scss'

type DateRangeSelectionProps = {
  minDate?: Date | null
  maxDate?: Date | null
}

export const DateRangeSelection = ({ minDate, maxDate }: DateRangeSelectionProps) => {
  const { startDate: globalStartDate, endDate: globalEndDate } = useGlobalDateRange({ displayMode: 'dayRangePicker' })
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
    <HStack gap='xs' className='Layer__DateRangeSelection'>
      <DateSelectionComboBox />
      <DatePicker
        label='Start Date'
        showLabel={false}
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
        showLabel={false}
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
