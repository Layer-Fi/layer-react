export type MonthOption = {
  key: number
  label: string
  abbreviation: string
}

const ARBITRARY_REFERENCE_YEAR = 2020
export const getMonths = (locale: string): MonthOption[] => {
  const labelFormatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  const abbreviationFormatter = new Intl.DateTimeFormat(locale, { month: 'short' })

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(ARBITRARY_REFERENCE_YEAR, index, 1)
    return {
      key: index + 1,
      label: labelFormatter.format(date),
      abbreviation: abbreviationFormatter.format(date),
    }
  })
}
