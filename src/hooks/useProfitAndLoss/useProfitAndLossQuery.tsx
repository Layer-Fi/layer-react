import { useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { ProfitAndLoss, ReportingBasis } from '../../types'
import { DataModel } from '../../types/general'
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
  const { auth, businessId, apiUrl, syncTimestamps, read, hasBeenTouched } =
    useLayerContext()

  const queryKey =
    businessId &&
    startDate &&
    endDate &&
    auth?.access_token &&
    `profit-and-loss-${businessId}-${startDate.valueOf()}-${endDate.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
      ',',
    )}-${reportingBasis}`

  const {
    data: rawData,
    isLoading,
    isValidating,
    error: rawError,
    mutate,
  } = useSWR(
    queryKey,
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

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.PROFIT_AND_LOSS, queryKey)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  }, [syncTimestamps, startDate, endDate, tagFilter, reportingBasis])

  return {
    startDate,
    endDate,
    // data: rawData?.data, // @TODO - TOM
    data: testData(rawData?.data),
    isLoading,
    isValidating,
    error: rawError,
    refetch,
  }
}

const testData = (data?: ProfitAndLoss) => {
  if (!data) {
    return
  }

  const a = {
    ...data,
    expenses: {
      ...data.expenses,
      line_items: data?.expenses?.line_items?.map(x => {
        if (['FEES', 'MEALS'].includes(x.name ?? '')) {
          return { ...x, value: -(x.value ?? 0) }
        }
        return x
      }),
    },
    cost_of_goods_sold: {
      ...data.cost_of_goods_sold,
      line_items: data?.cost_of_goods_sold?.line_items?.map(x => {
        if (['LABOR_EXPENSE'].includes(x.name ?? '')) {
          return { ...x, value: -(x.value ?? 0) }
        }
        return x
      }),
    },
  } as ProfitAndLoss

  console.log('datatest', a)

  return a
}
