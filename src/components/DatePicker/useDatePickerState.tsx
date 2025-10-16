import { useCallback, useEffect, useMemo, useState } from 'react'
import { ZonedDateTime } from '@internationalized/date'
import { getIsDateInvalid } from './utils'
import { convertDateToZonedDateTime } from '../../utils/time/timeUtils'

type UseDatePickerStateArgs = {
  date: Date
  setDate?: (date: Date) => void
  minDate?: Date | null
  maxDate?: Date | null
}

export const useDatePickerState = ({ date, setDate, minDate = null, maxDate = null }: UseDatePickerStateArgs) => {
  const dateZdt = useMemo(() => convertDateToZonedDateTime(date), [date])
  const minDateZdt = useMemo(() => convertDateToZonedDateTime(minDate), [minDate])
  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(maxDate), [maxDate])

  const [localDate, setLocalDate] = useState<ZonedDateTime | null>(dateZdt)
  const isInitialDateInvalid = getIsDateInvalid(dateZdt, { minDate: minDateZdt, maxDate: maxDateZdt })

  const [isInvalid, setIsInvalid] = useState(!!isInitialDateInvalid)
  const [errorText, setErrorText] = useState<string | null>(isInitialDateInvalid)

  useEffect(() => {
    // Mirror global date into local date if it changes.
    setLocalDate(dateZdt)

    const invalid = getIsDateInvalid(dateZdt, { minDate: minDateZdt, maxDate: maxDateZdt })
    setIsInvalid(!!invalid)
    setErrorText(invalid)
  }, [minDate, maxDate, dateZdt, minDateZdt, maxDateZdt])

  const onChange = useCallback(
    (date: ZonedDateTime | null) => {
      setLocalDate(date)

      // Don’t show errors for empty/partial year while typing
      if (date === null || date.year <= 1000) {
        setIsInvalid(true)
        setErrorText(null)
        return
      }

      const invalid = getIsDateInvalid(date, { minDate: minDateZdt, maxDate: maxDateZdt })
      if (invalid) {
        setIsInvalid(true)
        setErrorText(invalid)
        return
      }

      // Clear errors and commit globally
      setIsInvalid(false)
      setErrorText(null)
      setDate?.(date.toDate())
    },
    [minDateZdt, maxDateZdt, setDate],
  )

  const onBlur = useCallback(() => {
    const invalid = getIsDateInvalid(localDate, { minDate: minDateZdt, maxDate: maxDateZdt })

    setIsInvalid(!!invalid)
    setErrorText(invalid)
  }, [localDate, minDateZdt, maxDateZdt])

  return useMemo(() => ({
    localDate,
    isInvalid,
    errorText,
    onChange,
    onBlur,
    minDateZdt,
    maxDateZdt,
  }), [errorText, isInvalid, localDate, onBlur, onChange, maxDateZdt, minDateZdt])
}
