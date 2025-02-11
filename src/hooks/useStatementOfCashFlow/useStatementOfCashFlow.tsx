import { useCallback, useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, StatementOfCashFlow } from '../../types'
import { DataModel } from '../../types/general'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'

type UseStatementOfCashFlow = () => {
  data: StatementOfCashFlow | undefined
  date?: DateRange
  setDate: (date: DateRange) => void
  isLoading: boolean
  refetch: () => void
}

export const useStatementOfCashFlow: UseStatementOfCashFlow = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined)

  const { businessId, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const startDateString = format(
    startOfDay(date?.startDate ?? new Date()),
    'yyyy-MM-dd\'T\'HH:mm:ssXXX',
  )
  const endDateString = format(
    startOfDay(date?.endDate ?? new Date()),
    'yyyy-MM-dd\'T\'HH:mm:ssXXX',
  )

  const queryKey =
    businessId
    && startDateString
    && endDateString
    && auth?.access_token
    && `statement-of-cash-${businessId}-${startDateString}-${endDateString}`

  console.log('queryKey', queryKey)

  const { data, isLoading, isValidating, mutate } = useSWR(
    queryKey,
    Layer.getStatementOfCashFlow(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: startDateString,
        endDate: endDateString,
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
  }, [queryKey, isLoading, isValidating, read])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  }, [syncTimestamps, startDateString, endDateString, queryKey, refetch, hasBeenTouched])

  return { data: data?.data, date, setDate, isLoading, refetch }
}
