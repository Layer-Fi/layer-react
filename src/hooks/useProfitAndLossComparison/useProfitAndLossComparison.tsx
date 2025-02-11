import { useState } from 'react'
import { Layer } from '../../api/layer'
import { TagComparisonOption } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, MoneyFormat, ReportingBasis } from '../../types'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { prepareFiltersBody, preparePeriodsBody } from './utils'
import useSWR from 'swr'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Props = {
  reportingBasis?: ReportingBasis
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  periods,
  tagFilters,
  reportingBasis,
  compareMode,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  periods: string
  tagFilters: string
  reportingBasis?: ReportingBasis
  compareMode?: boolean
}) {
  if (accessToken && apiUrl && compareMode) {
    return {
      apiUrl,
      businessId,
      periods,
      tagFilters,
      reportingBasis,
    }
  }
}

export function useProfitAndLossComparison({
  reportingBasis,
}: Props) {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriods, setComparePeriods] = useState(0)
  const [compareOptions, setCompareOptions] = useState<TagComparisonOption[]>(
    [],
  )
  const { rangeDisplayMode, start, end } = useGlobalDateRange()
  const dateRange = { startDate: start, endDate: end }

  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const periods = preparePeriodsBody(dateRange, comparePeriods, rangeDisplayMode)
  const tagFilters = prepareFiltersBody(compareOptions)

  const queryKey = buildKey({
    ...auth,
    businessId,
    periods: JSON.stringify(periods),
    tagFilters: JSON.stringify(tagFilters),
    reportingBasis: reportingBasis,
    compareMode,
  })

  const { data, isLoading, isValidating } = useSWR(
    queryKey,
    async () => {
      const response = await Layer.compareProfitAndLoss(apiUrl, auth?.access_token, {
        params: {
          businessId,
        },
        body: {
          periods: periods!,
          tag_filters: tagFilters,
          reporting_basis: reportingBasis,
        },
      })
      return response.data
    },
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
    compareMode,
    setCompareMode,
    comparePeriods,
    setComparePeriods,
    compareOptions,
    setCompareOptions,
    getProfitAndLossComparisonCsv,
  }
}
