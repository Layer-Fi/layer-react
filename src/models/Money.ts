export const centsToDollars = (cents: number): string =>
  (cents / 100).toFixed(2)

export const dollarsToCents = (dollars: string): number =>
  Math.round(parseFloat(dollars) * 100)

export default {
  centsToDollars,
  dollarsToCents,
}
