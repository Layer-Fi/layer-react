import { useContext, useMemo, useState } from 'react'
import { differenceInCalendarMonths, differenceInCalendarYears } from 'date-fns'
import { type MultiValue } from 'react-select'
import useSWR from 'swr'

import { type DateRange, type MoneyFormat, type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossCompareConfig, type ProfitAndLossComparisonRequestBody, type ProfitAndLossComparisonTags, type TagComparisonOption } from '@internal-types/profit_and_loss'
import { type ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { prepareFiltersBody, preparePeriodsBody } from '@hooks/useProfitAndLossComparison/utils'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { DateGroupBy } from '@components/DateSelection/DateGroupByComboBox'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Props = {
  reportingBasis?: ReportingBasis
  comparisonConfig?: ProfitAndLossCompareConfig
}

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
  const [comparisonPeriodMode, setComparisonPeriodMode] = useState<DateGroupBy | null>(DateGroupBy.AllTime)
  const { dateSelectionMode } = useContext(ProfitAndLossContext)
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'month' })

  const comparePeriods = useMemo(() => {
    if (!comparisonPeriodMode || comparisonPeriodMode === DateGroupBy.AllTime) {
      return 1
    }

    if (comparisonPeriodMode === DateGroupBy.Year) {
      return Math.abs(differenceInCalendarYears(endDate, startDate)) + 1
    }

    return Math.abs(differenceInCalendarMonths(endDate, startDate)) + 1
  }, [comparisonPeriodMode, endDate, startDate])

  const [selectedCompareOptions, setSelectedCompareOptionsState] = useState<TagComparisonOption[]>(
    comparisonConfig?.defaultTagFilter ? [comparisonConfig?.defaultTagFilter] : [],
  )

  const dateRange = useGlobalDateRange({ dateSelectionMode })

  const compareModeActive = useMemo(() => (
    comparePeriods > 1
    || selectedCompareOptions.length > 1
    || (selectedCompareOptions.length === 1 && isNotOnlyNoneTag(selectedCompareOptions))
  ), [comparePeriods, selectedCompareOptions])

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

  const periods = preparePeriodsBody(dateRange, comparePeriods, comparisonPeriodMode)
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
    const periods = preparePeriodsBody(dateRange, comparePeriods, comparisonPeriodMode)
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
    compareModeActive,
    comparePeriods,
    compareOptions: comparisonConfig?.tagComparisonOptions ?? [],
    selectedCompareOptions,
    setSelectedCompareOptions,
    getProfitAndLossComparisonCsv,
    comparisonConfig,
    comparisonPeriodMode,
    setComparisonPeriodMode,
  }
}
