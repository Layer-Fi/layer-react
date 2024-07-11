import { useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { BalanceSheet } from '../../types'
import { DataModel } from '../../types/general'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'

type UseBalanceSheet = (date?: Date) => {
  data: BalanceSheet | undefined
  isLoading: boolean
  error: unknown
  refetch: () => void
}

export const useBalanceSheet: UseBalanceSheet = (date: Date = new Date()) => {
  const { auth, businessId, apiUrl, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const dateString = format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ssXXX")

  const { data, isLoading, isValidating, error, mutate } = useSWR(
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

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (isLoading || isValidating) {
      read(DataModel.BALANCE_SHEET)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (hasBeenTouched(DataModel.BALANCE_SHEET)) {
      refetch()
    }
  }, [syncTimestamps])

  return { data: data?.data, isLoading, error, refetch }
}
