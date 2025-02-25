import { parseISO, format as formatDateFns } from 'date-fns'
import { DATE_FORMAT } from '../config/general'

/**
 * Capitalize first letter of the given text.
 */
export const capitalizeFirstLetter = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Convert number into percentage.
 *
 * @example
 * 0.112 -> 11%
 * 0.09843 -> 9.8%
 * 0.00123 -> 0.12%
 */
export const formatPercent = (
  value?: number,
  options?: Intl.NumberFormatOptions,
) => {
  if (!value && value !== 0) {
    return
  }

  const val = value * 100

  let defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }

  if (Math.abs(val) < 10) {
    defaultOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  }

  if (Math.abs(val) < 1) {
    defaultOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  }

  if (val === 0) {
    defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  }

  return val.toLocaleString('en-US', {
    ...defaultOptions,
    ...options,
  })
}

/**
 * Convert Enum-like (upper snakecase) text into human friendly format.
 */
export const humanizeEnum = (text: string) => {
  return capitalizeFirstLetter(text.replace(/_/gi, ' ').toLowerCase())
}

export const convertNumberToCurrency = (amount: number | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return ''

  const formattedValue = amount.toLocaleString('en-US')

  return formattedValue.length > 0 ? `$${formattedValue}` : ''
}

export const convertCurrencyToNumber = (amount: string): string =>
  amount
    .replace('$', '')
    .replace(',', '')
    .replace(/[^\d.]/g, '')
    .replace(/(?!^)-/g, '')
    .replace(/(\..*)\./g, '$1')
    .replace(/(\.\d{2})\d+/, '$1')
    .replace(/^0(?!\.)/, '')

/**
 * Convert amount to cents by multiplying by 100.
 * For example:
 * 100.00 -> 10000
 * 100.01 -> 10001
 * 100.001 -> 10000
 */
export const convertToCents = (amount?: number | string | null): number | undefined => {
  try {
    if (amount === undefined || amount === null) {
      return undefined
    }

    return Math.round(Number(amount) * 100)
  }
  catch {
    return undefined
  }
}

/**
 * Convert amount from cents to dollars.
 * For example:
 * 10000 -> 100
 * 10001 -> 100.01
 */
export const convertFromCents = (
  amount?: number | string | readonly string[] | null,
): number | undefined => {
  try {
    if (amount === undefined || amount === null) {
      return undefined
    }

    return Number((Number(amount) / 100).toFixed(2))
  }
  catch {
    return undefined
  }
}

/**
 * Convert cents amount to currency in dollars.
 */
export const convertCentsToCurrency = (amount?: number | string): string | undefined => {
  try {
    if (amount === undefined) {
      return undefined
    }

    return convertNumberToCurrency(convertFromCents(amount))
  }
  catch {
    return undefined
  }
}

/**
 * Format date to a given format. By default, it uses the DATE_FORMAT.
 */
export const formatDate = (date?: string | Date, dateFormat: string = DATE_FORMAT): string => {
  try {
    if (!date) {
      return ''
    }

    return formatDateFns(date instanceof Date ? date : parseISO(date), dateFormat)
  }
  catch {
    return ''
  }
}
