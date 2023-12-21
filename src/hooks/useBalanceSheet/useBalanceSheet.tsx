import { Layer } from '../../api/layer'
import { BalanceSheet } from '../../types'
import { useLayerContext } from '../useLayerContext'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'

type UseBalanceSheet = (date?: Date) => {
  data: BalanceSheet | undefined
  isLoading: boolean
  error: unknown
}

export const useBalanceSheet: UseBalanceSheet = (date: Date = new Date()) => {
  const { auth, businessId } = useLayerContext()
  const dateString = format(startOfDay(date), 'yyyy-mm-dd')

  const { data, isLoading, error } = useSWR(
    businessId &&
      dateString &&
      auth?.access_token &&
      `balance-sheet-${businessId}-${dateString}`,
    Layer.getBalanceSheet(auth?.access_token, {
      params: { businessId, date: dateString },
    }),
  )

  return { data, isLoading, error }
}
