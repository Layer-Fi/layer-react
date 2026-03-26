import { type MonthNameFormatFn } from '@utils/i18n/date/formatters'
import { MonthPattern } from '@utils/i18n/date/patterns'

export type MonthOption = {
  key: number
  label: string
  abbreviation: string
}

export const getMonths = (formatMonthName: MonthNameFormatFn): MonthOption[] => {
  return Array.from({ length: 12 }, (_, index) => {
    return {
      key: index + 1,
      label: formatMonthName(index + 1, MonthPattern.Month),
      abbreviation: formatMonthName(index + 1, MonthPattern.MonthShort),
    }
  })
}
