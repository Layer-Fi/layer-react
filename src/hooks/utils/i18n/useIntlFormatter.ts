import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'

import {
  type DateFormatFn,
  type DateRangeFormatFn,
  formatDate as formatDateFn,
  formatDateRange as formatDateRangeFn,
  formatMonthName as formatMonthNameFn,
  type MonthNameFormatFn,
} from '@utils/i18n/date/formatters'
import type { DateInput } from '@utils/i18n/date/input'
import { type DateFormat } from '@utils/i18n/date/patterns'
import {
  formatMinutesAsDuration as formatMinutesAsDurationFn,
  type MinutesAsDurationFormatFn,
} from '@utils/i18n/duration/formatters'
import {
  type CurrencyFormatFn,
  formatCurrencyFromCents as formatCurrencyFromCentsFn,
  formatNumber as formatNumberFn,
  formatPercent as formatPercentFn,
  type NumberFormatFn,
  type PercentFormatFn,
} from '@utils/i18n/number/formatters'

export type IntlFormatter = {
  formatCurrencyFromCents: CurrencyFormatFn
  formatNumber: NumberFormatFn
  formatPercent: PercentFormatFn
  formatDate: DateFormatFn
  formatDateRange: DateRangeFormatFn
  formatMonthName: MonthNameFormatFn
  formatMinutesAsDuration: MinutesAsDurationFormatFn
}

export function useIntlFormatter(): IntlFormatter {
  const intl = useIntl()

  const formatDate: DateFormatFn = useCallback((value, format) => {
    return formatDateFn(intl, value, format)
  }, [intl])

  const formatMonthName: MonthNameFormatFn = useCallback((monthNumber, format?) => {
    return formatMonthNameFn(intl, monthNumber, format)
  }, [intl])

  const formatDateRange: DateRangeFormatFn = useCallback((startDate: DateInput, endDate: DateInput, format?: DateFormat) => {
    return formatDateRangeFn(intl, startDate, endDate, format)
  }, [intl])

  const formatCurrencyFromCents: CurrencyFormatFn = useCallback((value, options) => {
    return formatCurrencyFromCentsFn(intl, value, options)
  }, [intl])

  const formatNumber: NumberFormatFn = useCallback((value, options) => {
    return formatNumberFn(intl, value, options)
  }, [intl])

  const formatPercent: PercentFormatFn = useCallback((value, options) => {
    return formatPercentFn(intl, value, options)
  }, [intl])

  const formatMinutesAsDuration: MinutesAsDurationFormatFn = useCallback((totalMinutes, options) => {
    return formatMinutesAsDurationFn(intl, totalMinutes, options)
  }, [intl])

  return useMemo(
    () => ({
      formatCurrencyFromCents,
      formatNumber,
      formatPercent,
      formatDate,
      formatDateRange,
      formatMonthName,
      formatMinutesAsDuration,
    }),
    [
      formatCurrencyFromCents,
      formatNumber,
      formatPercent,
      formatDate,
      formatDateRange,
      formatMonthName,
      formatMinutesAsDuration,
    ],
  )
}
