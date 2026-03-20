import { useCallback, useEffect, useMemo, useState } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { useTranslation } from 'react-i18next'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { DateInvalidReason, getDateInvalidReason } from '@components/DatePicker/utils'

type UseDatePickerStateArgs = {
  date: Date
  setDate?: (date: Date) => void
  minDate?: Date | null
  maxDate?: Date | null
}

export const useDatePickerState = ({ date, setDate, minDate = null, maxDate = null }: UseDatePickerStateArgs) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const dateZdt = useMemo(() => convertDateToZonedDateTime(date), [date])
  const minDateZdt = useMemo(() => minDate ? convertDateToZonedDateTime(minDate) : null, [minDate])
  const maxDateZdt = useMemo(() => maxDate ? convertDateToZonedDateTime(maxDate) : null, [maxDate])

  const getErrorText = useCallback((reason: DateInvalidReason | null): string | null => {
    switch (reason) {
      case DateInvalidReason.Empty:
        return t('date:validation.date_not_empty', 'Cannot select empty date')
      case DateInvalidReason.BeforeMin:
        return t('date:validation.date_before_min', 'Cannot select date before {{minDate}}', { minDate: minDateZdt ? formatDate(minDateZdt.toDate()) : '' })
      case DateInvalidReason.AfterMax:
        return t('date:validation.date_in_future', 'Cannot select date in the future')
      default:
        return null
    }
  }, [formatDate, minDateZdt, t])

  const [localDate, setLocalDate] = useState<ZonedDateTime | null>(dateZdt)
  const initialInvalidReason = getDateInvalidReason(dateZdt, { minDate: minDateZdt, maxDate: maxDateZdt })

  const [isInvalid, setIsInvalid] = useState(initialInvalidReason !== null)
  const [errorText, setErrorText] = useState<string | null>(getErrorText(initialInvalidReason))

  useEffect(() => {
    setLocalDate(dateZdt)

    const reason = getDateInvalidReason(dateZdt, { minDate: minDateZdt, maxDate: maxDateZdt })
    setIsInvalid(reason !== null)
    setErrorText(getErrorText(reason))
  }, [dateZdt, getErrorText, maxDate, maxDateZdt, minDate, minDateZdt])

  const onChange = useCallback(
    (date: ZonedDateTime | null) => {
      setLocalDate(date)

      // Don’t show errors for empty/partial year while typing.
      if (date === null || date.year <= 1000) {
        setIsInvalid(true)
        setErrorText(null)
        return
      }

      const reason = getDateInvalidReason(date, { minDate: minDateZdt, maxDate: maxDateZdt })
      if (reason) {
        setIsInvalid(true)
        setErrorText(getErrorText(reason))
        return
      }

      setIsInvalid(false)
      setErrorText(null)
      setDate?.(date.toDate())
    },
    [getErrorText, maxDateZdt, minDateZdt, setDate],
  )

  const onBlur = useCallback(() => {
    const reason = getDateInvalidReason(localDate, { minDate: minDateZdt, maxDate: maxDateZdt })

    setIsInvalid(reason !== null)
    setErrorText(getErrorText(reason))
  }, [getErrorText, localDate, maxDateZdt, minDateZdt])

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
