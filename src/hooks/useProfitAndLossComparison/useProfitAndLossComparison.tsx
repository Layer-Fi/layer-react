import { useState, useCallback, useRef } from 'react'
import { Layer } from '../../api/layer'
import { TagComparisonOption } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, MoneyFormat, ReportingBasis } from '../../types'
import {
  ProfitAndLossComparison,
} from '../../types/profit_and_loss'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { prepareFiltersBody, preparePeriodsBody } from './utils'

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
  const [comparePeriods, setComparePeriods] = useState(0)
  const [compareOptions, setCompareOptions] = useState<TagComparisonOption[]>(
    [],
  )
  const { rangeDisplayMode } = useGlobalDateRange()
  const [data, setData] = useState<ProfitAndLossComparison | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const refetch = (dateRange: DateRange, actAsInitial?: boolean) => {
    if (actAsInitial && !initialFetchDone) {
      void fetchPnLComparisonData(dateRange, comparePeriods, compareOptions)
    }
    else if (!actAsInitial) {
      void fetchPnLComparisonData(dateRange, comparePeriods, compareOptions)
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
        const periods = preparePeriodsBody(dateRange, compareMonths, rangeDisplayMode)

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
    [auth?.access_token, businessId, apiUrl, rangeDisplayMode, reportingBasis],
  )

  const getProfitAndLossComparisonCsv = (
    dateRange: DateRange,
    moneyFormat?: MoneyFormat,
  ) => {
    const periods = preparePeriodsBody(dateRange, comparePeriods, rangeDisplayMode)
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
    comparePeriods,
    setComparePeriods,
    compareOptions,
    setCompareOptions,
    refetch,
    getProfitAndLossComparisonCsv,
  }
}
