import { HStack } from '@ui/Stack/Stack'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'
import { useEffect } from 'react'
import './dateRangeSelection.scss'
import classNames from 'classnames'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'

type DateRangeSelectionProps = {
  minDate?: Date | null
  maxDate?: Date | null
}

export const DateRangeSelection = ({ minDate, maxDate }: DateRangeSelectionProps) => {
  const { startDate: globalStartDate, endDate: globalEndDate } = useGlobalDateRange({ displayMode: 'full' })
  const { setDateRange: setGlobalDateRange } = useGlobalDateRangeActions()
  const { value } = useSizeClass()

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
    <HStack className={classNames('Layer__DateRangeSelection', {
      'Layer__DateRangeSelection--mobile': value === 'mobile',
    })}
    >
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
