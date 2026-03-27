import type { IntlShape } from 'react-intl'

import { getCurrencyForLocale } from '@utils/i18n/number/currency'
import {
  type NumberInput,
  toLocalizedNumber,
} from '@utils/i18n/number/input'

type CurrencyFormatOptions = Pick<Intl.NumberFormatOptions, 'signDisplay' | 'useGrouping'>
type NumberFormatOptions = Pick<Intl.NumberFormatOptions, 'minimumFractionDigits' | 'maximumFractionDigits' | 'compactDisplay' | 'notation' | 'useGrouping'>
type PercentFormatOptions = Pick<Intl.NumberFormatOptions, 'minimumFractionDigits' | 'maximumFractionDigits'>

export type CurrencyFormatFn = (value: NumberInput, options?: CurrencyFormatOptions) => string
export type NumberFormatFn = (value: NumberInput, options?: NumberFormatOptions) => string
export type PercentFormatFn = (value: NumberInput, options?: PercentFormatOptions) => string

export const formatCurrencyFromCents = (
  intl: IntlShape,
  value: NumberInput,
  options: CurrencyFormatOptions = {},
) => {
  const parsed = toLocalizedNumber(value, intl.locale)
  if (parsed === undefined) return ''

  return intl.formatNumber(parsed / 100, {
    style: 'currency',
    currency: getCurrencyForLocale(intl.locale),
    ...options,
  })
}

export const formatNumber = (
  intl: IntlShape,
  value: NumberInput,
  options: NumberFormatOptions = {},
) => {
  const parsed = toLocalizedNumber(value, intl.locale)
  if (parsed === undefined) return ''

  return intl.formatNumber(parsed, {
    style: 'decimal',
    ...options,
  })
}

export const formatPercent = (
  intl: IntlShape,
  value: NumberInput,
  options: PercentFormatOptions = {},
) => {
  const parsed = toLocalizedNumber(value, intl.locale)
  if (parsed === undefined) return ''

  return intl.formatNumber(parsed / 100, {
    style: 'percent',
    ...options,
  })
}
