import { useCallback, useMemo } from 'react'
import { DatePicker } from '@components/DatePicker/DatePicker'
import { useGlobalDate, useGlobalDateActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDatePickerState } from '@components/DatePicker/useDatePickerState'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { endOfDay, startOfDay } from 'date-fns'

export const GlobalDatePicker = () => {
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
      showLabel={false}
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
