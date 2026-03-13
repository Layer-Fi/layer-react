import { getMonthNameFromNumber } from '@utils/date'

export type MonthOption = {
  key: number
  label: string
  abbreviation: string
}

export const getMonths = (locale: string): MonthOption[] => {
  return Array.from({ length: 12 }, (_, index) => {
    return {
      key: index + 1,
      label: getMonthNameFromNumber(index + 1, locale, 'long'),
      abbreviation: getMonthNameFromNumber(index + 1, locale, 'short'),
    }
  })
}
