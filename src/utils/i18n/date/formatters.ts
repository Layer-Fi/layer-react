import type { IntlShape } from 'react-intl'

import { type DateInput, toDate } from '@utils/i18n/date/input'
import { getDateFormatOptions } from '@utils/i18n/date/options'
import { DateFormat, MonthPattern } from '@utils/i18n/date/patterns'

const ARBITRARY_REFERENCE_YEAR = 2020

export type DateFormatFn = (value: DateInput, format?: DateFormat) => string
export type DateRangeFormatFn = (startDate: DateInput, endDate: DateInput, format?: DateFormat) => string
export type MonthNameFormatFn = (monthNumber: number, format?: MonthPattern) => string

export const formatDate = (intl: IntlShape, value: DateInput, format: DateFormat = DateFormat.DateShort) => {
  const date = toDate(value)
  if (!date) return ''

  return intl.formatDate(date, getDateFormatOptions(format))
}

export const formatMonthName = (intl: IntlShape, monthNumber: number, format: MonthPattern = MonthPattern.Month) => {
  if (monthNumber < 1 || monthNumber > 12) {
    return ''
  }

  const date = new Date(ARBITRARY_REFERENCE_YEAR, monthNumber - 1, 1)
  return intl.formatDate(date, getDateFormatOptions(format))
}

export const formatDateRange = (intl: IntlShape, startDate: DateInput, endDate: DateInput, format: DateFormat = DateFormat.DateShort) => {
  const start = toDate(startDate)
  const end = toDate(endDate)
  if (!start || !end) return ''

  return intl.formatDateTimeRange(start, end, getDateFormatOptions(format))
}
