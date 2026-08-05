import { useCallback } from 'react'

import { type DateFormat } from '@utils/shared/i18n/date/patterns'
import { useGlobalDate } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

export const useGlobalDateFormatter = () => {
  const { formatDate } = useIntlFormatter()
  const { date } = useGlobalDate()

  return useCallback((format: DateFormat) => {
    return formatDate(date, format)
  }, [date, formatDate])
}
