import { useEffect, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { ReportingBasis } from '../../types'
import { LoadedStatus } from '../../types/general'
import { ProfitAndLossSummary } from '../../types/profit_and_loss'
import { useLayerContext } from '../useLayerContext'
import { endOfMonth, startOfMonth } from 'date-fns'
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
}

const buildDates = ({ currentDate }: { currentDate: Date }) => {
  return {
    startYear: startOfMonth(currentDate).getFullYear() - 1,
    startMonth: startOfMonth(currentDate).getMonth() + 1,
    endYear: startOfMonth(currentDate).getFullYear(),
    endMonth: startOfMonth(currentDate).getMonth() + 1,
  }
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
  const { businessId, auth, apiUrl } = useLayerContext()
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

  return {
    data,
    isLoading,
    loaded,
    error,
    pullData,
  }
}
