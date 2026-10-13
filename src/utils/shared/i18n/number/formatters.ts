import type { FormatNumberOptions, IntlShape } from 'react-intl'

import { getCurrencyForLocale } from '@utils/shared/i18n/number/currency'
import { type NumberInput, toLocalizedNumber } from '@utils/shared/i18n/number/input'

type CurrencyFormatOptions = Pick<FormatNumberOptions, 'signDisplay' | 'useGrouping'>
type NumberFormatOptions = Pick<FormatNumberOptions, 'minimumFractionDigits' | 'maximumFractionDigits' | 'compactDisplay' | 'notation' | 'useGrouping'>
type PercentFormatOptions = Pick<FormatNumberOptions, 'minimumFractionDigits' | 'maximumFractionDigits'>

export type CurrencyFormatFn = (value: NumberInput, options?: CurrencyFormatOptions) => string
export type NumberFormatFn = (value: NumberInput, options?: NumberFormatOptions) => string
export type PercentFormatFn = (value: NumberInput, options?: PercentFormatOptions) => string
export type FileSizeFormatFn = (bytes: number) => string

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

  return intl.formatNumber(parsed, {
    style: 'percent',
    ...options,
  })
}

const FILE_SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const

export const formatFileSize = (intl: IntlShape, bytes: number) => {
  const exponent = Math.min(Math.max(Math.floor(Math.log10(Math.max(bytes, 1)) / 3), 0), FILE_SIZE_UNITS.length - 1)

  return intl.formatNumber(bytes / 1000 ** exponent, {
    style: 'unit',
    unit: FILE_SIZE_UNITS[exponent],
    unitDisplay: exponent === 0 ? 'long' : 'short',
    maximumFractionDigits: exponent < 2 ? 0 : 1,
  })
}
