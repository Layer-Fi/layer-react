import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { MonthYearPattern } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

export const useGlobalMonthSubtitle = () => {
  const { formatDate } = useIntlFormatter()
  const { date } = useGlobalDate({ dateSelectionMode: 'month' })
  return formatDate(date, MonthYearPattern.MonthYear)
}
