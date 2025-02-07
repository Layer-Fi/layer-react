import { useEffect, useState, useCallback, useRef } from 'react'
import { Layer } from '../../api/layer'
import { TagComparisonOption } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, MoneyFormat, ReportingBasis } from '../../types'
import {
  ProfitAndLossComparison,
} from '../../types/profit_and_loss'
import { startOfMonth, subMonths, getYear, getMonth } from 'date-fns'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { range } from '../../utils/array/range'
import { isArrayWithAtLeastOne } from '../../utils/array/getArrayWithAtLeastOneOrFallback'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Props = {
  reportingBasis?: ReportingBasis
}

let initialFetchDone = false

export function useProfitAndLossComparison({
  reportingBasis,
}: Props) {
  const lastQuery =
    useRef<
      Promise<{ data?: ProfitAndLossComparison | undefined, error?: unknown }>
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

  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  useEffect(() => {
    if (
      compareMonths > 1
      || compareOptions.filter(x => x.displayName).length > 0
    ) {
      if (compareMode === false) {
        setCompareMode(true)
      }
    }
    else {
      setCompareMode(false)
    }
  }, [compareMonths, compareOptions])

  const prepareFiltersBody = (compareOptions: TagComparisonOption[]) => {
    const noneFilters = compareOptions.filter(
      ({ tagFilterConfig: { tagFilters } }) => tagFilters === 'None')

    const tagFilters = compareOptions.flatMap(({ tagFilterConfig: { tagFilters } }) => {
      if (tagFilters === 'None') {
        return null
      }

      if (tagFilters.tagValues.length === 0) {
        return { required_tags: [] }
      }

      return tagFilters.tagValues.map(tagValue => ({
        required_tags: [{
          key: tagFilters.tagKey,
          value: tagValue,
        }],
      }))
    }).filter(item => item !== null)

    if (tagFilters.length === 0) {
      return
    }

    const allFilters = [
      noneFilters.length > 0
        ? { required_tags: [] }
        : null,
      ...tagFilters,
    ].filter(item => item !== null)

    return isArrayWithAtLeastOne(allFilters) ? allFilters : undefined
  }

  const preparePeriodsBody = (dateRange: DateRange, compareMonths: number) => {
    const adjustedStartDate = startOfMonth(dateRange.startDate)

    const rawMonths = range(0, compareMonths).map((index) => {
      const currentMonth = subMonths(adjustedStartDate, index)

      return {
        year: getYear(currentMonth),
        month: getMonth(currentMonth) + 1,
      }
    })

    const sortedMonths = rawMonths.sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month
      }

      return a.year - b.year
    })

    return isArrayWithAtLeastOne(sortedMonths)
      ? {
        type: 'Comparison_Months' as const,
        months: sortedMonths,
      }
      : undefined
  }

  const refetch = (dateRange: DateRange, actAsInitial?: boolean) => {
    if (actAsInitial && !initialFetchDone) {
      fetchPnLComparisonData(dateRange, compareMonths, compareOptions)
    }
    else if (!actAsInitial) {
      fetchPnLComparisonData(dateRange, compareMonths, compareOptions)
    }
  }

  const fetchPnLComparisonData = useCallback(
    async (
      dateRange: DateRange,
      compareMonths: number,
      compareOptions: TagComparisonOption[],
    ) => {
      if (!auth?.access_token || !businessId || !apiUrl) {
        return
      }
      setIsLoading(true)
      setIsValidating(true)
      initialFetchDone = true
      try {
        const periods = preparePeriodsBody(dateRange, compareMonths)

        if (!periods) {
          setIsLoading(false)
          setIsValidating(false)
          return
        }

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
      }
      catch (err) {
        setError(err)
        setData(undefined)
        setIsLoading(false)
        setIsValidating(false)
      }
    },
    [
      apiUrl,
      auth,
      businessId,
      reportingBasis,
    ],
  )

  const getProfitAndLossComparisonCsv = (
    dateRange: DateRange,
    moneyFormat?: MoneyFormat,
  ) => {
    const periods = preparePeriodsBody(dateRange, compareMonths)
    const tagFilters = prepareFiltersBody(compareOptions)
    return Layer.profitAndLossComparisonCsv(apiUrl, auth?.access_token, {
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
