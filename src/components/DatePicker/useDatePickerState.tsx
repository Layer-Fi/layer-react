import { useCallback, useEffect, useMemo, useState } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { useTranslation } from 'react-i18next'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { getIsDateInvalid } from '@components/DatePicker/utils'

type UseDatePickerStateArgs = {
  date: Date
  setDate?: (date: Date) => void
  minDate?: Date | null
  maxDate?: Date | null
}

export const useDatePickerState = ({ date, setDate, minDate = null, maxDate = null }: UseDatePickerStateArgs) => {
  const { t } = useTranslation()
  const dateZdt = useMemo(() => convertDateToZonedDateTime(date), [date])
  const minDateZdt = useMemo(() => minDate ? convertDateToZonedDateTime(minDate) : null, [minDate])
  const maxDateZdt = useMemo(() => maxDate ? convertDateToZonedDateTime(maxDate) : null, [maxDate])

  const [localDate, setLocalDate] = useState<ZonedDateTime | null>(dateZdt)
  const isInitialDateInvalid = getIsDateInvalid(dateZdt, { minDate: minDateZdt, maxDate: maxDateZdt }, t)

  const [isInvalid, setIsInvalid] = useState(!!isInitialDateInvalid)
  const [errorText, setErrorText] = useState<string | null>(isInitialDateInvalid)

  useEffect(() => {
    setLocalDate(dateZdt)

    const invalid = getIsDateInvalid(dateZdt, { minDate: minDateZdt, maxDate: maxDateZdt }, t)
    setIsInvalid(!!invalid)
    setErrorText(invalid)
  }, [minDate, maxDate, dateZdt, minDateZdt, maxDateZdt, t])

  const onChange = useCallback(
    (date: ZonedDateTime | null) => {
      setLocalDate(date)

      // Don’t show errors for empty/partial year while typing.
      if (date === null || date.year <= 1000) {
        setIsInvalid(true)
        setErrorText(null)
        return
      }

      const invalid = getIsDateInvalid(date, { minDate: minDateZdt, maxDate: maxDateZdt }, t)
      if (invalid) {
        setIsInvalid(true)
        setErrorText(invalid)
        return
      }

      setIsInvalid(false)
      setErrorText(null)
      setDate?.(date.toDate())
    },
    [minDateZdt, maxDateZdt, setDate, t],
  )

  const onBlur = useCallback(() => {
    const invalid = getIsDateInvalid(localDate, { minDate: minDateZdt, maxDate: maxDateZdt }, t)

    setIsInvalid(!!invalid)
    setErrorText(invalid)
  }, [localDate, minDateZdt, maxDateZdt, t])

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
