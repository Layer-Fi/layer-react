import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { type DatePattern, getDateFormatOptions, toDate } from '@utils/time/dateIntl'
import { DateFormat, MonthPattern } from '@utils/time/timeFormats'

type DateInput = Parameters<typeof toDate>[0]
export type DateTimeFormatFn = (value: DateInput, format?: DatePattern) => string
export type MonthNameFormatFn = (monthNumber: number, format?: MonthPattern) => string
export type DateTimeRangeFormatFn = (
  startDate: DateInput,
  endDate: DateInput,
  format?: DatePattern,
) => string

export type IntlFormatter = {
  formatDate: DateTimeFormatFn
  formatMonthName: MonthNameFormatFn
  formatDateRange: DateTimeRangeFormatFn
}

const ARBITRARY_REFERENCE_YEAR = 2020
export function useIntlFormatter(): IntlFormatter {
  const intl = useIntl()

  const formatDate = useCallback((value: DateInput, format: DatePattern = DateFormat.DateShort) => {
    const date = toDate(value)
    if (!date) return ''

    return intl.formatDate(date, getDateFormatOptions(format))
  }, [intl])

  const formatMonthName = useCallback((monthNumber: number, format: MonthPattern = MonthPattern.Month) => {
    if (monthNumber < 1 || monthNumber > 12) {
      return ''
    }

    const date = new Date(ARBITRARY_REFERENCE_YEAR, monthNumber - 1, 1)
    return intl.formatDate(date, getDateFormatOptions(format))
  }, [intl])

  const formatDateRange = useCallback((startDate: DateInput, endDate: DateInput, format: DatePattern = DateFormat.DateShort) => {
    const start = toDate(startDate)
    const end = toDate(endDate)
    if (!start || !end) return ''

    return intl.formatDateTimeRange(start, end, getDateFormatOptions(format))
  }, [intl])

  return useMemo(
    () => ({ formatDate, formatMonthName, formatDateRange }),
    [formatDate, formatMonthName, formatDateRange],
  )
}
