import { useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { BalanceSheet } from '../../types'
import { DataModel } from '../../types/general'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'

type UseBalanceSheet = (date?: Date) => {
  data: BalanceSheet | undefined
  isLoading: boolean
  error: unknown
  refetch: () => void
}

export const useBalanceSheet: UseBalanceSheet = (date: Date = new Date()) => {
  const { businessId, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const dateString = format(startOfDay(date), 'yyyy-MM-dd\'T\'HH:mm:ssXXX')

  const queryKey =
    businessId &&
    dateString &&
    auth?.access_token &&
    `balance-sheet-${businessId}-${dateString}`

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
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
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.BALANCE_SHEET, queryKey)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  }, [syncTimestamps, dateString])

  return { data: data?.data, isLoading, error, refetch }
}
