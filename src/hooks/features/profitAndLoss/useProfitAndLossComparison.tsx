import { useContext, useMemo, useState } from 'react'
import { differenceInCalendarMonths, differenceInCalendarYears } from 'date-fns'
import { getMonth, getYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { type MultiValue } from 'react-select'

import type { S3PresignedUrl } from '@internal-types/general'
import { type DateRange, type MoneyFormat, type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossCompareConfig, type ProfitAndLossComparisonTags, type TagComparisonOption } from '@internal-types/profitAndLoss'
import { DateGroupBy } from '@schemas/reports/unifiedReport'
import { post } from '@utils/api/authenticatedHttp'
import { isArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { type ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { range } from '@utils/array/range'
import { toLocalDateString } from '@utils/time/timeUtils'
import { useProfitAndLossComparisonReport } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss-comparison/useProfitAndLossComparisonReport'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'

function prepareFiltersBody(compareOptions: TagComparisonOption[]): ReadonlyArrayWithAtLeastOne<ProfitAndLossComparisonTags> | undefined {
  const noneFilters = compareOptions.filter(
    ({ tagFilterConfig: { tagFilters } }) => tagFilters === 'None')

  const tagFilters = compareOptions.flatMap(({ tagFilterConfig: { tagFilters, structure } }) => {
    if (tagFilters === 'None') {
      return null
    }

    if (tagFilters.tagValues.length === 0) {
      const filter: ProfitAndLossComparisonTags = {
        structure,
        required_tags: [],
      }
      return filter
    }

    return tagFilters.tagValues.map((tagValue) => {
      const filter: ProfitAndLossComparisonTags = {
        structure,
        required_tags: [{
          key: tagFilters.tagKey,
          value: tagValue,
        }],
      }
      return filter
    })
  }).filter((item): item is ProfitAndLossComparisonTags => item !== null)

  if (tagFilters.length === 0) {
    return
  }

  const allFilters = [
    noneFilters.length > 0
      ? {
        structure: noneFilters[0].tagFilterConfig.structure,
        required_tags: [],
      } as ProfitAndLossComparisonTags
      : null,
    ...tagFilters,
  ].filter((item): item is ProfitAndLossComparisonTags => item !== null)

  return isArrayWithAtLeastOne(allFilters) ? allFilters : undefined
}

function preparePeriodsBodyForMonths(dateRange: DateRange, comparePeriods: number) {
  const adjustedEndDate = startOfMonth(dateRange.endDate)

  const rawPeriods = range(0, comparePeriods).map((index) => {
    const currentPeriod = subMonths(adjustedEndDate, index)

    return {
      year: getYear(currentPeriod),
      month: getMonth(currentPeriod) + 1,
    }
  })

  const sortedPeriods = rawPeriods.sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month
    }

    return a.year - b.year
  })

  if (!isArrayWithAtLeastOne(sortedPeriods)) {
    return
  }

  return {
    type: 'Comparison_Months' as const,
    months: sortedPeriods,
  }
}

function preparePeriodsBodyForYears(dateRange: DateRange, comparePeriods: number) {
  const adjustedEndDate = startOfYear(dateRange.endDate)

  const rawPeriods = range(0, comparePeriods).map((index) => {
    const currentPeriod = subYears(adjustedEndDate, index)

    return {
      year: getYear(currentPeriod),
    }
  })

  const sortedPeriods = rawPeriods.sort((a, b) => {
    return a.year - b.year
  })

  if (!isArrayWithAtLeastOne(sortedPeriods)) {
    return
  }

  return {
    type: 'Comparison_Years' as const,
    years: sortedPeriods,
  }
}

function preparePeriodsBodyForDateRange(dateRange: DateRange) {
  return {
    type: 'Comparison_Date_Ranges' as const,
    date_ranges: [{
      start_date: toLocalDateString(dateRange.startDate),
      end_date: toLocalDateString(dateRange.endDate),
    }],
  } as const
}

export function preparePeriodsBody(
  dateRange: DateRange,
  comparePeriods: number,
  comparisonPeriodMode: DateGroupBy | null,
) {
  switch (comparisonPeriodMode) {
    case DateGroupBy.Year:
      return preparePeriodsBodyForYears(dateRange, comparePeriods)
    case DateGroupBy.Month:
      return preparePeriodsBodyForMonths(dateRange, comparePeriods)
    case DateGroupBy.AllTime:
    default:
      return preparePeriodsBodyForDateRange(dateRange)
  }
}

const profitAndLossComparisonCsv = post<{
  data?: S3PresignedUrl
  error?: unknown
}>(
  ({ businessId, moneyFormat }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/comparison-csv?money_format=${
      moneyFormat ? moneyFormat : 'DOLLAR_STRING'
    }`,
)

type Props = {
  reportingBasis?: ReportingBasis
  comparisonConfig?: ProfitAndLossCompareConfig
}

const isNotOnlyNoneTag = (compareOptions?: TagComparisonOption[]) => {
  return !!(
    compareOptions?.some(option => option.tagFilterConfig.tagFilters !== 'None')
  )
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
      comparisonConfig?.tagComparisonOptions?.find(
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

  const periods = compareModeActive
    ? preparePeriodsBody(dateRange, comparePeriods, comparisonPeriodMode)
    : undefined
  const tagFilters = compareModeActive
    ? prepareFiltersBody(selectedCompareOptions)
    : undefined

  const { data, isLoading, isValidating, isError } = useProfitAndLossComparisonReport({
    periods,
    tagFilters,
    reportingBasis,
  })

  const getProfitAndLossComparisonCsv = (
    dateRange: DateRange,
    moneyFormat?: MoneyFormat,
  ) => {
    const periods = preparePeriodsBody(dateRange, comparePeriods, comparisonPeriodMode)
    const tagFilters = prepareFiltersBody(selectedCompareOptions)
    return profitAndLossComparisonCsv(apiUrl, auth?.access_token, {
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
    isError,
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
