import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBusinessDatePickerBounds } from '@hooks/utils/dates/useBusinessDatePickerBounds'
import { useGlobalDate, useGlobalDateActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'

export const GlobalDatePicker = ({ showLabel = false }: { showLabel?: boolean }) => {
  const { t } = useTranslation()
  const { date } = useGlobalDate({ dateSelectionMode: 'full' })
  const { setDate: setGlobalDate } = useGlobalDateActions()
  const { minDate, maxDate } = useBusinessDatePickerBounds()

  const setDate = useCallback((date: Date) => {
    setGlobalDate({ date })
  }, [setGlobalDate])

  const { localDate, onChange, minDateZdt, maxDateZdt, errorText, onBlur, isInvalid } = useDatePickerState({
    date,
    setDate,
    minDate,
    maxDate,
  })

  return (
    <DatePicker
      label={t('date:label.effective_date', 'Effective date')}
      date={localDate}
      onChange={onChange}
      minDate={minDateZdt}
      maxDate={maxDateZdt}
      isInvalid={isInvalid}
      errorText={errorText}
      onBlur={onBlur}
      slotProps={{ Label: { size: 'sm', pbe: '3xs' } }}
      showLabel={showLabel}
    />
  )
}
