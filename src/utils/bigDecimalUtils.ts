import { BigDecimal as BD, Option } from 'effect'

export const BIG_DECIMAL_ZERO = BD.fromBigInt(BigInt(0))
export const BIG_DECIMAL_ONE = BD.fromBigInt(BigInt(1))
export const BIG_DECIMAL_ONE_HUNDRED = BD.fromBigInt(BigInt(100))

export const buildDecimalCharRegex = ({
  allowNegative = true,
  allowPercent = false,
  allowDollar = false,
} = {}): RegExp => {
  let allowed = '\\d.,'

  if (allowNegative) allowed += '\\-'
  if (allowPercent) allowed += '%'
  if (allowDollar) allowed += '\\$'

  return new RegExp(`^[${allowed}]+$`)
}

/**
 * Converts a BigDecimal dollar amount to its equivalent in cents as a number.
 * Example: 123.45 → 12345
 */
export const convertBigDecimalToCents = (amount: BD.BigDecimal): number => {
  // Multiply the amount by 100 to get the value in cents
  const scaled = BD.multiply(amount, BIG_DECIMAL_ONE_HUNDRED)

  // Round to the nearest whole number (zero decimal places)
  const rounded = BD.round(scaled, { scale: 0 })

  // Extract the value of the BigDecimal and convert from bigint to number
  return Number(rounded.value)
}

export const convertCentsToBigDecimal = (cents: number): BD.BigDecimal => {
  // Create a BigDecimal representing the cents
  const decimalCents = BD.fromBigInt(BigInt(cents))

  // Divide by 100 to get the dollar amount
  return BD.unsafeDivide(decimalCents, BIG_DECIMAL_ONE_HUNDRED)
}

export const convertPercentToDecimal = (percent: BD.BigDecimal): BD.BigDecimal => {
  return BD.unsafeDivide(percent, BIG_DECIMAL_ONE_HUNDRED)
}

export const convertDecimalToPercent = (decimal: BD.BigDecimal): BD.BigDecimal => {
  return BD.multiply(decimal, BIG_DECIMAL_ONE_HUNDRED)
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

export function formatBigDecimalToString(
  value: BD.BigDecimal,
  options: {
    mode: 'percent' | 'currency' | 'decimal'
    minDecimalPlaces: number
    maxDecimalPlaces: number
  } = {
    mode: 'decimal',
    minDecimalPlaces: 0,
    maxDecimalPlaces: 3,
  },
): string {
  const normalizedBigDecimal = BD.normalize(value)
  const { mode, minDecimalPlaces, maxDecimalPlaces } = options

  const formatter = new Intl.NumberFormat(
    'en-US',
    {
      style: 'decimal',
      ...(mode === 'percent' && { style: 'percent' }),
      ...(mode === 'currency' && { style: 'currency', currency: 'USD' }),
      minimumFractionDigits: minDecimalPlaces,
      maximumFractionDigits: maxDecimalPlaces,
    },
  )

  let decimalAsNumber = 0
  try {
    decimalAsNumber = BD.unsafeToNumber(normalizedBigDecimal)
  }
  catch { /* empty */ }

  return formatter.format(decimalAsNumber)
}
