import { useEffect, useState, useCallback, useRef } from 'react'
import { Layer } from '../../api/layer'
import { TagComparisonOption } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, MoneyFormat, ReportingBasis } from '../../types'
import { S3PresignedUrl } from '../../types/general'
import {
  ProfitAndLossComparison,
  ProfitAndLossComparisonItem,
} from '../../types/profit_and_loss'
import { startOfMonth, subMonths, getYear, getMonth } from 'date-fns'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Periods = {
  type: 'Comparison_Months'
  months: Array<{ year: number; month: number }>
}

type TagFilter = Array<{
  required_tags: Array<{
    key: string
    value: string
  }>
  structure?: string
}>

type Props = {
  reportingBasis?: ReportingBasis
}

type UseProfitAndLossComparison = (props: Props) => {
  data: ProfitAndLossComparisonItem[] | undefined
  isLoading: boolean
  isValidating: boolean
  error: unknown
  compareMode: boolean
  setCompareMode: (mode: boolean) => void
  compareMonths: number
  setCompareMonths: (months: number) => void
  compareOptions: TagComparisonOption[]
  setCompareOptions: (options: TagComparisonOption[]) => void
  refetch: (dateRange: DateRange, actAsInitial?: boolean) => void
  getProfitAndLossComparisonCsv: (
    dateRange: DateRange,
    moneyFormat?: MoneyFormat,
  ) => Promise<{ data?: S3PresignedUrl; error?: unknown }>
}

let initialFetchDone = false

export const useProfitAndLossComparison: UseProfitAndLossComparison = ({
  reportingBasis,
}: Props) => {
  const lastQuery =
    useRef<
      Promise<{ data?: ProfitAndLossComparison | undefined; error?: unknown }>
    >()

  const [compareMode, setCompareMode] = useState(false)
  const [compareMonths, setCompareMonths] = useState(0)
  const [compareOptions, setCompareOptions] = useState<TagComparisonOption[]>(
    [],
  )
  const [data, setData] = useState<ProfitAndLossComparison | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const { auth, businessId, apiUrl } = useLayerContext()

  useEffect(() => {
    if (
      compareMonths > 1 ||
      compareOptions.filter(x => x.displayName).length > 0
    ) {
      if (compareMode === false) {
        setCompareMode(true)
      }
    } else {
      setCompareMode(false)
    }
  }, [compareMonths, compareOptions])

  const prepareFiltersBody = (compareOptions: TagComparisonOption[]) => {
    const tagFilters: TagFilter = []
    compareOptions.map(option => {
      if (option.tagFilterConfig.tagFilters === 'None') {
        tagFilters.push({
          required_tags: [],
          structure: option.tagFilterConfig.structure,
        })
      } else {
        const tagFilter = option.tagFilterConfig.tagFilters
        tagFilters.push({
          required_tags: tagFilter.tagValues.map(tagValue => {
            return {
              key: tagFilter.tagKey,
              value: tagValue,
            }
          }),
          structure: option.tagFilterConfig.structure,
        })
      }
    })
    return tagFilters
  }

  const preparePeriodsBody = (dateRange: DateRange, compareMonths: number) => {
    const periods: Periods = {
      type: 'Comparison_Months',
      months: [],
    }
    const adjustedStartDate = startOfMonth(dateRange.startDate)

    for (let i = 0; i < compareMonths; i++) {
      const currentMonth = subMonths(adjustedStartDate, i)
      periods.months.push({
        year: getYear(currentMonth),
        month: getMonth(currentMonth) + 1,
      })
    }

    periods.months.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year
      }
      return a.month - b.month
    })

    return periods
  }

  const refetch = (dateRange: DateRange, actAsInitial?: boolean) => {
    if (actAsInitial && !initialFetchDone) {
      fetchPnLComparisonData(dateRange, compareMonths, compareOptions)
    } else if (!actAsInitial) {
      fetchPnLComparisonData(dateRange, compareMonths, compareOptions)
    }
  }

  const fetchPnLComparisonData = useCallback(
    async (
      dateRange: DateRange,
      compareMonths: number,
      compareOptions: TagComparisonOption[],
    ) => {
      if (!auth.access_token || !businessId || !apiUrl) {
        return
      }
      setIsLoading(true)
      setIsValidating(true)
      initialFetchDone = true
      try {
        const periods = preparePeriodsBody(dateRange, compareMonths)
        const tagFilters = prepareFiltersBody(compareOptions)
        const request = Layer.compareProfitAndLoss(apiUrl, auth?.access_token, {
          params: {
            businessId,
          },
          body: {
            periods,
            tag_filters: tagFilters,
            reporting_basis: reportingBasis,
          },
        })
        lastQuery.current = request
        const results = await request
        if (lastQuery.current === request) {
          setData(results.data)
          setError(null)
          setIsLoading(false)
          setIsValidating(false)
        }
      } catch (err) {
        setError(err)
        setData(undefined)
        setIsLoading(false)
        setIsValidating(false)
      }
    },
    [
      apiUrl,
      auth,
      auth?.access_token,
      businessId,
      compareOptions,
      compareMonths,
      reportingBasis,
    ],
  )

  const getProfitAndLossComparisonCsv = (
    dateRange: DateRange,
    moneyFormat?: MoneyFormat,
  ) => {
    const periods = preparePeriodsBody(dateRange, compareMonths)
    const tagFilters = prepareFiltersBody(compareOptions)
    return Layer.profitAndLossComparisonCsv(apiUrl, auth.access_token, {
      params: {
        businessId,
        moneyFormat,
      },
      body: {
        periods,
        tag_filters: tagFilters,
        reporting_basis: reportingBasis,
      },
    })
  }

  return {
    data: data?.pnls,
    isLoading,
    isValidating,
    error,
    compareMode,
    setCompareMode,
    compareMonths,
    setCompareMonths,
    compareOptions,
    setCompareOptions,
    refetch,
    getProfitAndLossComparisonCsv,
  }
}
