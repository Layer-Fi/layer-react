const formatter = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 1,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const centsToDollars = (cents: number = NaN): string =>
  isNaN(cents) ? '-.--' : formatter.format(cents / 100)

export function centsToDollarsWithoutCommas(cents: number = 0) {
  return centsToDollars(cents).replaceAll(',', '')
}

export const dollarsToCents = (dollars: string = ''): number =>
  Math.round(parseFloat(dollars) * 100)

export default {
  centsToDollars,
  dollarsToCents,
}
