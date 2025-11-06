import { useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { DateRange, MoneyFormat, ReportingBasis } from '../../types/general'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { prepareFiltersBody, preparePeriodsBody } from './utils'
import useSWR from 'swr'
import { MultiValue } from 'react-select'
import { ProfitAndLossCompareConfig, ProfitAndLossComparisonTags, TagComparisonOption, type ProfitAndLossComparisonRequestBody } from '../../types/profit_and_loss'
import { ReadonlyArrayWithAtLeastOne } from '../../utils/array/getArrayWithAtLeastOneOrFallback'
import { ReportKey, useReportModeWithFallback } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Props = {
  reportingBasis?: ReportingBasis
  comparisonConfig?: ProfitAndLossCompareConfig
}

const COMPARE_MODES_SUPPORTING_MULTI_PERIOD = ['monthPicker', 'yearPicker']

const isNotOnlyNoneTag = (compareOptions?: TagComparisonOption[]) => {
  return Boolean(
    compareOptions?.some(option => option.tagFilterConfig.tagFilters !== 'None'),
  )
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
  periods?: ProfitAndLossComparisonRequestBody['periods']
  tagFilters: ReadonlyArrayWithAtLeastOne<ProfitAndLossComparisonTags> | undefined
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

  const rangeDisplayMode = useReportModeWithFallback(ReportKey.ProfitAndLoss, 'monthPicker')
  const dateRange = useGlobalDateRange({ displayMode: rangeDisplayMode })

  const isPeriodsSelectEnabled = COMPARE_MODES_SUPPORTING_MULTI_PERIOD.includes(rangeDisplayMode)
  const effectiveComparePeriods = isPeriodsSelectEnabled
    ? comparePeriods
    : 1

  const compareModeActive = useMemo(() => (
    effectiveComparePeriods > 1
    || selectedCompareOptions.length > 1
    || (selectedCompareOptions.length === 1 && isNotOnlyNoneTag(selectedCompareOptions))
  ), [effectiveComparePeriods, selectedCompareOptions])

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

  const periods = preparePeriodsBody(dateRange, effectiveComparePeriods, rangeDisplayMode)
  const tagFilters = prepareFiltersBody(selectedCompareOptions)

  const queryKey = buildKey({
    ...auth,
    businessId,
    periods,
    tagFilters,
    reportingBasis,
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
    const periods = preparePeriodsBody(dateRange, effectiveComparePeriods, rangeDisplayMode)
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
    isPeriodsSelectEnabled,
    compareModeActive,
    comparePeriods: effectiveComparePeriods,
    setComparePeriods,
    compareOptions: comparisonConfig?.tagComparisonOptions ?? [],
    selectedCompareOptions,
    setSelectedCompareOptions,
    getProfitAndLossComparisonCsv,
    comparisonConfig,
  }
}
