import { BigDecimal as BD } from 'effect'

export const BIG_DECIMAL_ZERO = BD.fromBigInt(0n)

/**
 * Converts a BigDecimal dollar amount to its equivalent in cents as a number.
 * Example: 123.45 → 12345
 */
export const convertBigDecimalToCents = (amount: BD.BigDecimal): number => {
  // Multiply the amount by 100 to get the value in cents
  const scaled = BD.multiply(amount, BD.fromBigInt(100n))

  // Round to the nearest whole number (zero decimal places)
  const rounded = BD.round(scaled, { scale: 0 })

  // Extract the value of the BigDecimal and convert from bigint to number
  return Number(rounded.value)
}

export const convertCentsToBigDecimal = (cents: number): BD.BigDecimal => {
  // Create a BigDecimal representing the cents
  const decimalCents = BD.fromBigInt(BigInt(cents))

  // Divide by 100 to get the dollar amount
  return BD.unsafeDivide(decimalCents, BD.fromBigInt(100n))
}

export function formatBigDecimalToString(
  value: BD.BigDecimal,
  maxLength: number = 10,
): string {
  const normalizedBigDecimal = BD.normalize(value)

  const formatter = new Intl.NumberFormat(
    'en-US',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxLength,
    },
  )

  let decimalAsNumber = 0
  try {
    decimalAsNumber = BD.unsafeToNumber(normalizedBigDecimal)
  }
  catch { /* empty */ }

  return formatter.format(decimalAsNumber)
}
