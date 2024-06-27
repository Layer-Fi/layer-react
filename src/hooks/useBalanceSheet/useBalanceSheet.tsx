import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { BalanceSheet } from '../../types'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'

type UseBalanceSheet = (date?: Date) => {
  data: BalanceSheet | undefined
  isLoading: boolean
  error: unknown
  refetch: () => void
}

export const useBalanceSheet: UseBalanceSheet = (date: Date = new Date()) => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const dateString = format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ssXXX")

  const { data, isLoading, error, mutate } = useSWR(
    businessId &&
      dateString &&
      auth?.access_token &&
      `balance-sheet-${businessId}-${dateString}`,
    Layer.getBalanceSheet(apiUrl, auth?.access_token, {
      params: {
        businessId,
        effectiveDate: dateString,
      },
    }),
  )

  const refetch = () => {
    mutate()
  }

  return { data: data?.data, isLoading, error, refetch }
}
