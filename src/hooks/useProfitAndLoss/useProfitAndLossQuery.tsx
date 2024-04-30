import { Layer } from '../../api/layer'
import { ProfitAndLoss, ReportingBasis } from '../../types'
import { useLayerContext } from '../useLayerContext'
import { startOfMonth, endOfMonth, formatISO } from 'date-fns'
import useSWR from 'swr'

type UseProfitAndLossQueryProps = {
  startDate: Date
  endDate: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
}

type UseProfitAndLossQueryReturn = (props?: UseProfitAndLossQueryProps) => {
  data?: ProfitAndLoss
  isLoading: boolean
  isValidating: boolean
  error: any
  refetch: () => void
  startDate: Date
  endDate: Date
}

export const useProfitAndLossQuery: UseProfitAndLossQueryReturn = (
  {
    startDate,
    endDate,
    tagFilter,
    reportingBasis,
  }: UseProfitAndLossQueryProps = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
) => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const {
    data: rawData,
    isLoading,
    isValidating,
    error: rawError,
    mutate,
  } = useSWR(
    businessId &&
      startDate &&
      endDate &&
      auth?.access_token &&
      `profit-and-loss-${businessId}-${startDate.valueOf()}-${endDate.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
        ',',
      )}-${reportingBasis}`,
    Layer.getProfitAndLoss(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: formatISO(startDate.valueOf()),
        endDate: formatISO(endDate.valueOf()),
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.values?.join(','),
        reportingBasis,
      },
    }),
  )

  const refetch = () => {
    mutate()
  }

  return {
    startDate,
    endDate,
    data: rawData?.data,
    isLoading,
    isValidating,
    error: rawError,
    refetch,
  }
}
