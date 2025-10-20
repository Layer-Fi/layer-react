import { useCallback } from 'react'
import { HStack } from '../ui/Stack/Stack'
import { DateSelectionComboBox } from './DateSelectionComboBox'
import { DatePicker } from '../DatePicker/DatePicker'
import { useGlobalDate, useGlobalDateActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useDatePickerState } from '../DatePicker/useDatePickerState'

type DateSelectionProps = {
  minDate?: Date | null
  maxDate?: Date | null
}

export const DateSelection = ({ minDate, maxDate }: DateSelectionProps) => {
  const { date } = useGlobalDate()
  const { setDate: setGlobalDate } = useGlobalDateActions()

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
    <HStack gap='xs' className='Layer__DateSelection'>
      <DateSelectionComboBox />
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
    </HStack>
  )
}
