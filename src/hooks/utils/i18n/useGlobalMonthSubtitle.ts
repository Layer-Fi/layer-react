import { MonthYearPattern, YearPattern } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export const useGlobalLabels = () => {
  const { formatDate } = useIntlFormatter()
  const { date } = useGlobalDate({ dateSelectionMode: 'month' })
  return {
    [MonthYearPattern.MonthYear]: formatDate(date, MonthYearPattern.MonthYear),
    [YearPattern.Year]: formatDate(date, YearPattern.Year),
  }
}
