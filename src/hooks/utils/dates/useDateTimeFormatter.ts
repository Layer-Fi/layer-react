import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { type DatePattern, getDateFormatOptions, toDate } from '@utils/time/dateIntl'
import { DateFormat } from '@utils/time/timeFormats'

type DateInput = Parameters<typeof toDate>[0]
type DateTimeFormatFn = (value: DateInput, format?: DatePattern) => string

type IntlFormatter = {
  formatDate: DateTimeFormatFn
}

export function useIntlFormatter(): IntlFormatter {
  const intl = useIntl()

  const formatDate = useCallback((value: DateInput, format: DatePattern = DateFormat.DateShort) => {
    const date = toDate(value)
    if (!date) return ''

    return intl.formatDate(date, getDateFormatOptions(format))
  }, [intl])

  return { formatDate }
}
