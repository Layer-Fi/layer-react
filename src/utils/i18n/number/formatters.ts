import type { IntlShape } from 'react-intl'

import { getCurrencyForLocale } from '@utils/i18n/number/currency'
import {
  type NumberInput,
  safeDivideByOneHundred,
  toNumber,
} from '@utils/i18n/number/input'

type CurrencyFormatOptions = Pick<Intl.NumberFormatOptions, 'signDisplay' | 'minimumFractionDigits' | 'maximumFractionDigits'>
type NumberFormatOptions = Pick<Intl.NumberFormatOptions, 'minimumFractionDigits' | 'maximumFractionDigits' | 'compactDisplay' | 'notation' | 'useGrouping'>
type PercentFormatOptions = Pick<Intl.NumberFormatOptions, 'minimumFractionDigits' | 'maximumFractionDigits'>

export type CurrencyFormatFn = (value: NumberInput, options?: CurrencyFormatOptions) => string
export type NumberFormatFn = (value: NumberInput, options?: NumberFormatOptions) => string
export type PercentFormatFn = (value: NumberInput, options?: PercentFormatOptions) => string
export type PercentFromHundredFormatFn = (value: NumberInput, options?: PercentFormatOptions) => string

export const formatCurrencyFromCents = (
  intl: IntlShape,
  value: NumberInput,
  options: CurrencyFormatOptions = {},
) => {
  const parsed = safeDivideByOneHundred(value)
  if (parsed === undefined) return ''

  return intl.formatNumber(parsed, {
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
  const parsed = toNumber(value)
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
  const parsed = toNumber(value)
  if (parsed === undefined) return ''

  return intl.formatNumber(parsed, {
    style: 'percent',
    ...options,
  })
}

export const formatPercentFromHundred = (
  intl: IntlShape,
  value: NumberInput,
  options: PercentFormatOptions = {},
) => {
  const parsed = safeDivideByOneHundred(value)
  if (parsed === undefined) return ''

  return intl.formatNumber(parsed, {
    style: 'percent',
    ...options,
  })
}
