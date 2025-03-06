import { useCallback, useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, StatementOfCashFlow } from '../../types'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { DataModel } from '../../types/general'
import { useDateRange } from '../useDateRange'

type UseStatementOfCashFlow = () => {
  data: StatementOfCashFlow | undefined
  date?: DateRange
  setDate: (date: DateRange) => void
  isLoading: boolean
  refetch: () => void
}

export const useStatementOfCashFlow: UseStatementOfCashFlow = () => {
  const { date, setDate } = useDateRange({})

  const { businessId, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const startDateString = date?.startDate && format(
    startOfDay(date?.startDate),
    'yyyy-MM-dd\'T\'HH:mm:ssXXX',
  )
  const endDateString = date?.endDate && format(
    startOfDay(date?.endDate),
    'yyyy-MM-dd\'T\'HH:mm:ssXXX',
  )

  const queryKey =
    businessId
    && startDateString
    && endDateString
    && auth?.access_token
    && `statement-of-cash-${businessId}-${startDateString}-${endDateString}`

  const { data, isLoading, isValidating, mutate } = useSWR(
    queryKey,
    Layer.getStatementOfCashFlow(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: startDateString ?? '',
        endDate: endDateString ?? '',
      },
    }),
  )

  const refetch = useCallback(() => {
    void mutate()
  }, [mutate])

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.STATEMENT_OF_CASH_FLOWS, queryKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey) && startDateString && endDateString) {
      refetch()
    }
  }, [syncTimestamps, startDateString, endDateString, queryKey, refetch, hasBeenTouched])

  return { data: data?.data, date, setDate, isLoading, refetch }
}
