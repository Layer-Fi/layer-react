import { BigDecimal as BD } from 'effect'

export const BIG_DECIMAL_ZERO = BD.fromBigInt(BigInt(0))
export const BIG_DECIMAL_ONE = BD.fromBigInt(BigInt(1))
export const BIG_DECIMAL_ONE_HUNDRED = BD.fromBigInt(BigInt(100))
export const DECIMAL_CHARS_REGEX = /^[\d.,-]+$/
export const NON_NEGATIVE_DECIMAL_CHARS_REGEX = /^[\d.,]+$/

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

export function formatBigDecimalToString(
  value: BD.BigDecimal,
  maxDecimalPlaces: number = 10,
): string {
  const normalizedBigDecimal = BD.normalize(value)

  const formatter = new Intl.NumberFormat(
    'en-US',
    {
      minimumFractionDigits: 0,
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
