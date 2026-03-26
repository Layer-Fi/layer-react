/**
 * Capitalize first letter of the given text.
 */
export const capitalizeFirstLetter = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Convert Enum-like (upper snakecase) text into human friendly format.
 */
export const humanizeEnum = (text: string) => {
  return capitalizeFirstLetter(text.replace(/_/gi, ' ').toLowerCase())
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

export const convertCentsToDecimalString = (
  amount: number,
): string => {
  return (Number(amount) / 100).toFixed(2)
}
