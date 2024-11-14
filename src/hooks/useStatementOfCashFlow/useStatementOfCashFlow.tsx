import { useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { StatementOfCashFlow } from '../../types'
import { DataModel } from '../../types/general'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'
import { useAuth } from '../useAuth'

type UseStatementOfCashFlow = (
  startDate?: Date,
  endDate?: Date,
) => {
  data: StatementOfCashFlow | undefined
  isLoading: boolean
  error: unknown
  refetch: () => void
}

export const useStatementOfCashFlow: UseStatementOfCashFlow = (
  startDate: Date = new Date(),
  endDate: Date = new Date(),
) => {
  const { businessId, apiUrl, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { data: auth } = useAuth()

  const startDateString = format(
    startOfDay(startDate),
    'yyyy-MM-dd\'T\'HH:mm:ssXXX',
  )
  const endDateString = format(startOfDay(endDate), 'yyyy-MM-dd\'T\'HH:mm:ssXXX')

  const queryKey =
    businessId &&
    startDateString &&
    endDateString &&
    auth?.access_token &&
    `statement-of-cash-${businessId}-${startDateString}-${endDateString}`

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
    Layer.getStatementOfCashFlow(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: startDateString,
        endDate: endDateString,
      },
    }),
  )

  const refetch = () => {
    mutate()
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.STATEMENT_OF_CASH_FLOWS, queryKey)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  }, [syncTimestamps, startDateString, endDateString])

  return { data: data?.data, isLoading, error, refetch }
}
