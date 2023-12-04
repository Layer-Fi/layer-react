const formatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 1,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const centsToDollars = (cents: number): string =>
  formatter.format(cents / 100)

export const dollarsToCents = (dollars: string): number =>
  Math.round(parseFloat(dollars) * 100)

export default {
  centsToDollars,
  dollarsToCents,
}
