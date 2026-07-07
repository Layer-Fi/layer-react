import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { type DateRange, isSameDateRange } from '@utils/date/dateRange'
import { useGlobalDatePickerBounds } from '@hooks/utils/dates/useGlobalDatePickerBounds'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'

type DateRangePickerProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  showLabels?: boolean
}

export const DateRangePicker = ({ dateRange, setDateRange, showLabels = false }: DateRangePickerProps) => {
  const { t } = useTranslation()
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
    date: dateRange.startDate,
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
    date: dateRange.endDate,
    minDate,
    maxDate,
  })

  const dateRangeRef = useRef(dateRange)

  useEffect(() => {
    dateRangeRef.current = dateRange
  }, [dateRange])

  useEffect(() => {
    if (startDateInvalid || endDateInvalid || !localStartDate || !localEndDate) return

    const next = { startDate: localStartDate.toDate(), endDate: localEndDate.toDate() }

    if (isSameDateRange(next, dateRangeRef.current)) return

    setDateRange(next)
  }, [startDateInvalid, endDateInvalid, localStartDate, localEndDate, setDateRange])

  return (
    <>
      <DatePicker
        label={t('date:label.start_date', 'Start date')}
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
        label={t('date:label.end_date', 'End date')}
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
