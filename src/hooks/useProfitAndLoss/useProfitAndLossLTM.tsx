import { useEffect, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { ReportingBasis } from '../../types'
import { DataModel, LoadedStatus } from '../../types/general'
import { ProfitAndLossSummary } from '../../types/profit_and_loss'
import { startOfMonth, sub } from 'date-fns'
import useSWR from 'swr'

type UseProfitAndLossLTMProps = {
  currentDate: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
}

export interface ProfitAndLossSummaryData extends ProfitAndLossSummary {
  isLoading?: boolean
}

type UseProfitAndLossLTMReturn = (props?: UseProfitAndLossLTMProps) => {
  data: ProfitAndLossSummaryData[]
  isLoading?: boolean
  loaded?: LoadedStatus
  error?: any
  pullData: (date: Date) => void
  refetch: () => void
}

const buildDates = ({ currentDate }: { currentDate: Date }) => {
  return {
    startYear: startOfMonth(currentDate).getFullYear() - 1,
    startMonth: startOfMonth(currentDate).getMonth() + 1,
    endYear: startOfMonth(currentDate).getFullYear(),
    endMonth: startOfMonth(currentDate).getMonth() + 1,
  }
}

const buildMonthsArray = (startDate: Date, endDate: Date) => {
  if (startDate >= endDate) {
    return []
  }

  var dates = []
  for (var d = startDate; d <= endDate; d.setMonth(d.getMonth() + 1)) {
    dates.push(new Date(d))
  }

  return dates
}

/**
 * Hooks fetch Last Twelve Months sending 12 requests (one for each month).
 * Implementation is not perfect, but we cannot use loops and arrays with hooks.
 */
export const useProfitAndLossLTM: UseProfitAndLossLTMReturn = (
  { currentDate, tagFilter, reportingBasis }: UseProfitAndLossLTMProps = {
    currentDate: new Date(),
  },
) => {
  const { businessId, auth, apiUrl, syncTimestamps, read, hasBeenTouched } =
    useLayerContext()
  const [date, setDate] = useState(currentDate)
  const [loaded, setLoaded] = useState<LoadedStatus>('initial')
  const [data, setData] = useState<ProfitAndLossSummaryData[]>([])

  const { startYear, startMonth, endYear, endMonth } = useMemo(() => {
    return buildDates({ currentDate: date })
  }, [date, businessId, tagFilter, reportingBasis])

  const {
    data: rawData,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWR(
    businessId &&
      Boolean(startYear) &&
      Boolean(startMonth) &&
      Boolean(endYear) &&
      Boolean(endMonth) &&
      auth?.access_token &&
      `profit-and-loss-summaries-${businessId}-${startYear.toString()}-${startMonth.toString()}-${tagFilter?.key}-${tagFilter?.values?.join(
        ',',
      )}-${reportingBasis}`,
    Layer.getProfitAndLossSummaries(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startYear: startYear.toString(),
        startMonth: startMonth.toString(),
        endYear: endYear.toString(),
        endMonth: endMonth.toString(),
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.values?.join(','),
        reportingBasis,
      },
    }),
  )

  useEffect(() => {
    // When new date range is set, populate 'data' with 'loading' items
    const newData = data.slice()

    const newPeriod = buildMonthsArray(sub(date, { years: 1 }), date)

    if (newData && newPeriod) {
      newPeriod.forEach(x => {
        if (
          !newData?.find(
            n => x.getMonth() + 1 === n.month && x.getFullYear() === n.year,
          )
        ) {
          newData.push({
            year: x.getFullYear(),
            month: x.getMonth() + 1,
            income: 0,
            costOfGoodsSold: 0,
            grossProfit: 0,
            operatingExpenses: 0,
            profitBeforeTaxes: 0,
            taxes: 0,
            netProfit: 0,
            fullyCategorized: false,
            totalExpenses: 0,
            uncategorizedInflows: 0,
            uncategorizedOutflows: 0,
            uncategorized_transactions: 0,
            isLoading: true,
          } satisfies ProfitAndLossSummaryData)
        }
      })
    }

    if (newData) {
      setData(
        newData.sort(
          (a, b) =>
            Number(new Date(a.year, a.month, 1)) -
            Number(new Date(b.year, b.month, 1)),
        ),
      )
    }
  }, [startYear, startMonth])

  useEffect(() => {
    const newData = rawData?.data?.months?.slice()

    if (data && newData) {
      data.forEach(x => {
        if (!newData?.find(n => x.month === n.month && x.year === n.year)) {
          newData.push({ ...x })
        }
      })
    }

    if (newData) {
      setData(
        newData.sort(
          (a, b) =>
            Number(new Date(a.year, a.month, 1)) -
            Number(new Date(b.year, b.month, 1)),
        ),
      )
    }
  }, [rawData])

  useEffect(() => {
    if (isLoading && loaded === 'initial') {
      setLoaded('loading')
      return
    }

    if (!isLoading && rawData) {
      setLoaded('complete')
    }
  }, [data, isLoading])

  const pullData = (date: Date) => setDate(date)

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (isLoading || isValidating) {
      read(DataModel.PROFIT_AND_LOSS)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (hasBeenTouched(DataModel.PROFIT_AND_LOSS)) {
      mutate()
    }
  }, [syncTimestamps])

  const refetch = () => {
    mutate()
  }

  return {
    data,
    isLoading,
    loaded,
    error,
    pullData,
    refetch,
  }
}
