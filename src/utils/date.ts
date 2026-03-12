const ARBITRARY_REFERENCE_YEAR = 2020

export const getMonthNameFromNumber = (monthNumber: number, locale: string): string => {
  if (monthNumber < 1 || monthNumber > 12) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  const date = new Date(ARBITRARY_REFERENCE_YEAR, monthNumber - 1, 1)
  return formatter.format(date)
}
