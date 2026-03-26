import { BigDecimal as BD, Option } from 'effect'

import type { IntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

import { getLocaleCurrencySymbol } from './i18n/number/currency'
import { getLocaleNumberSeparators } from './i18n/number/input'

export const BIG_DECIMAL_ZERO = BD.fromBigInt(BigInt(0))
export const BIG_DECIMAL_ONE = BD.fromBigInt(BigInt(1))
export const BIG_DECIMAL_NEG_ONE = BD.fromBigInt(BigInt(-1))
export const BIG_DECIMAL_ONE_HUNDRED = BD.fromBigInt(BigInt(100))

export const buildDecimalCharRegex = ({
  locale,
  allowNegative = true,
  allowPercent = false,
  allowCurrencySymbol = false,
}: {
  locale: string
  allowNegative?: boolean
  allowPercent?: boolean
  allowCurrencySymbol?: boolean
}): RegExp => {
  const separators = getLocaleNumberSeparators(locale)
  const allowedChars = new Set<string>([
    // Numerical values
    ...'0123456789',

    // Group and decimal separators
    separators.decimalSeparator,
    separators.groupSeparator,

    // All spaces
    ' ',
    '\u00A0',
    '\u202F',
  ])

  if (allowNegative) {
    allowedChars.add('-')
  }

  if (allowPercent) {
    allowedChars.add('%')
  }

  if (allowCurrencySymbol) {
    for (const char of getLocaleCurrencySymbol(locale)) {
      allowedChars.add(char)
    }
  }

  const escaped = Array.from(allowedChars)
    .map(char => char.replace(/[-\\\]^]/g, '\\$&'))
    .join('')

  return new RegExp(`^[${escaped}]+$`)
}

/**
 * Converts a BigDecimal dollar amount to its equivalent in cents as a bigint.
 * Example: 123.45 → 12345n
 */
export const convertBigDecimalToBigIntCents = (amount: BD.BigDecimal): bigint => {
  // Multiply the amount by 100 to get the value in cents
  const scaled = BD.multiply(amount, BIG_DECIMAL_ONE_HUNDRED)

  // Round to the nearest whole number (zero decimal places)
  const rounded = BD.round(scaled, { scale: 0 })

  // Extract the value of the BigDecimal as bigint
  return rounded.value
}

/**
 * Converts a BigDecimal dollar amount to its equivalent in cents as a number.
 * Example: 123.45 → 12345
 */
export const convertBigDecimalToCents = (amount: BD.BigDecimal): number => {
  return Number(convertBigDecimalToBigIntCents(amount))
}

export const convertBigIntCentsToBigDecimal = (cents: bigint): BD.BigDecimal => {
  // Create a BigDecimal representing the cents
  const decimalCents = BD.fromBigInt(cents)

  // Divide by 100 to get the dollar amount
  return BD.unsafeDivide(decimalCents, BIG_DECIMAL_ONE_HUNDRED)
}

export const convertCentsToBigDecimal = (cents: number): BD.BigDecimal => {
  return convertBigIntCentsToBigDecimal(BigInt(cents))
}

export const convertDecimalToPercent = (decimal: BD.BigDecimal): BD.BigDecimal => {
  return BD.multiply(decimal, BIG_DECIMAL_ONE_HUNDRED)
}

export const convertPercentToDecimal = (percent: BD.BigDecimal): BD.BigDecimal => {
  return BD.unsafeDivide(percent, BIG_DECIMAL_ONE_HUNDRED)
}

export const roundDecimalToCents = (decimal: BD.BigDecimal): BD.BigDecimal => {
  return BD.round(decimal, { scale: 2 })
}

export const safeDivide = (dividend: BD.BigDecimal, divisor: BD.BigDecimal): BD.BigDecimal => {
  const maybeQuotient = BD.divide(dividend, divisor)

  const quotient = Option.match(maybeQuotient, {
    onNone: () => BIG_DECIMAL_ZERO,
    onSome: innerQuotient => innerQuotient,
  })

  return quotient
}

export const negate = (value: BD.BigDecimal): BD.BigDecimal => {
  return BD.multiply(value, BIG_DECIMAL_NEG_ONE)
}

export function formatBigDecimalToString(
  formatter: IntlFormatter,
  value: BD.BigDecimal,
  options: {
    mode?: 'percent' | 'currency' | 'decimal'
    minDecimalPlaces?: number
    maxDecimalPlaces?: number
  } = {},
): string {
  const normalizedBigDecimal = BD.normalize(value)
  const { mode = 'decimal', minDecimalPlaces = 0, maxDecimalPlaces = 3 } = options

  let decimalAsNumber = 0
  try {
    decimalAsNumber = BD.unsafeToNumber(normalizedBigDecimal)
  }
  catch { /* empty */ }

  if (mode === 'percent') {
    return formatter.formatPercent(decimalAsNumber, {
      minimumFractionDigits: minDecimalPlaces,
      maximumFractionDigits: maxDecimalPlaces,
    })
  }

  if (mode === 'currency') {
    return formatter.formatCurrencyFromCents(convertBigDecimalToCents(normalizedBigDecimal))
  }

  return formatter.formatNumber(decimalAsNumber, {
    minimumFractionDigits: minDecimalPlaces,
    maximumFractionDigits: maxDecimalPlaces,
  })
}
