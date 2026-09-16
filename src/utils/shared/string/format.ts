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

export const convertCentsToDecimalString = (
  amount: number,
): string => {
  return (Number(amount) / 100).toFixed(2)
}
