import { useCallback } from 'react'

import { type DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDate } from '@providers/DateStore/GlobalDateStore/GlobalDateStoreProvider'

export const useGlobalDateFormatter = () => {
  const { formatDate } = useIntlFormatter()
  const { date } = useGlobalDate()

  return useCallback((format: DateFormat) => {
    return formatDate(date, format)
  }, [date, formatDate])
}
