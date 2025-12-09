import { useCallback, useMemo } from 'react'
import { endOfDay, startOfDay } from 'date-fns'

import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { useGlobalDate, useGlobalDateActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'

export const LabeledGlobalDatePicker = () => {
  const { date } = useGlobalDate()
  const { setDate: setGlobalDate } = useGlobalDateActions()

  const rawActivationDate = useBusinessActivationDate()
  const activationDate = useMemo(() => rawActivationDate ? startOfDay(rawActivationDate) : null, [rawActivationDate])

  const maxDate = useMemo(() => endOfDay(new Date()), [])

  const setDate = useCallback((date: Date) => {
    setGlobalDate({ date })
  }, [setGlobalDate])

  const { localDate, onChange, minDateZdt, maxDateZdt, errorText, onBlur, isInvalid } = useDatePickerState({
    date,
    setDate,
    minDate: activationDate,
    maxDate,
  })

  return (
    <DatePicker
      label='Effective Date'
      showLabel={true}
      date={localDate}
      onChange={onChange}
      minDate={minDateZdt}
      maxDate={maxDateZdt}
      isInvalid={isInvalid}
      errorText={errorText}
      onBlur={onBlur}
    />
  )
}
