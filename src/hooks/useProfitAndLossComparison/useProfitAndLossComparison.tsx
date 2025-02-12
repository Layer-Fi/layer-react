import { useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, MoneyFormat, ReportingBasis } from '../../types'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { prepareFiltersBody, preparePeriodsBody } from './utils'
import useSWR from 'swr'
import { MultiValue } from 'react-select'
import { ProfitAndLossCompareConfig, TagComparisonOption } from '../../types/profit_and_loss'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Props = {
  reportingBasis?: ReportingBasis
  comparisonConfig?: ProfitAndLossCompareConfig
}

const ALLOWED_COMPARE_MODES = ['monthPicker', 'yearPicker']

const hasNoneDefaultTag = (compareOptions?: TagComparisonOption[]) => {
  return compareOptions?.some(option => option.tagFilterConfig.tagFilters !== 'None')
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  periods,
  tagFilters,
  reportingBasis,
  compareModeActive,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  periods: string
  tagFilters: string
  reportingBasis?: ReportingBasis
  compareModeActive?: boolean
}) {
  if (accessToken && apiUrl && compareModeActive) {
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
  comparisonConfig,
}: Props) {
  const [comparePeriods, setComparePeriods] = useState(comparisonConfig?.defaultPeriods ?? 1)
  const [selectedCompareOptions, setSelectedCompareOptionsState] = useState<TagComparisonOption[]>(
    comparisonConfig?.defaultTagFilter ? [comparisonConfig?.defaultTagFilter] : [],
  )
  const { rangeDisplayMode, start, end } = useGlobalDateRange()
  const dateRange = { startDate: start, endDate: end }

  const isCompareDisabled = !ALLOWED_COMPARE_MODES.includes(rangeDisplayMode)

  const compareModeActive = useMemo(() => {
    if (isCompareDisabled) {
      return false
    }

    if ((comparePeriods > 1 || hasNoneDefaultTag(selectedCompareOptions)) && !isCompareDisabled) {
      return true
    }

    if (comparePeriods < 2 && !hasNoneDefaultTag(selectedCompareOptions)) {
      return false
    }

    return true
  }, [isCompareDisabled, comparePeriods, selectedCompareOptions])

  const setSelectedCompareOptions = (values: MultiValue<{ value: string, label: string }>) => {
    const options: TagComparisonOption[] = values.map(option =>
      comparisonConfig?.tagComparisonOptions.find(
        t => JSON.stringify(t.tagFilterConfig) === option.value,
      ),
    ).filter(Boolean) as TagComparisonOption[]

    if (options.length === 0 && comparisonConfig?.defaultTagFilter) {
      // Set default option if nothing selected
      setSelectedCompareOptionsState([comparisonConfig?.defaultTagFilter])
    }
    else {
      setSelectedCompareOptionsState(options)
    }
  }

  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const periods = preparePeriodsBody(dateRange, comparePeriods, rangeDisplayMode)
  const tagFilters = prepareFiltersBody(selectedCompareOptions)

  const queryKey = buildKey({
    ...auth,
    businessId,
    periods: JSON.stringify(periods),
    tagFilters: JSON.stringify(tagFilters),
    reportingBasis: reportingBasis,
    compareModeActive,
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
    const tagFilters = prepareFiltersBody(selectedCompareOptions)
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
    isCompareDisabled,
    compareModeActive,
    comparePeriods,
    setComparePeriods,
    compareOptions: comparisonConfig?.tagComparisonOptions ?? [],
    selectedCompareOptions,
    setSelectedCompareOptions,
    getProfitAndLossComparisonCsv,
    comparisonConfig,
  }
}
