import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { StatementOfCashFlow } from '../../types'
import { format, startOfDay } from 'date-fns'
import useSWR from 'swr'

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
  const { auth, businessId, apiUrl } = useLayerContext()
  const startDateString = format(
    startOfDay(startDate),
    "yyyy-MM-dd'T'HH:mm:ssXXX",
  )
  const endDateString = format(startOfDay(endDate), "yyyy-MM-dd'T'HH:mm:ssXXX")

  const { data, isLoading, error, mutate } = useSWR(
    businessId &&
      startDateString &&
      endDateString &&
      auth?.access_token &&
      `statement-of-cash-${businessId}-${startDateString}-${endDateString}`,
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

  return { data: data?.data, isLoading, error, refetch }
}
