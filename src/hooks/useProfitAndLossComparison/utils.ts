import { getMonth, getYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'

import { type DateRange } from '@internal-types/general'
import { type ProfitAndLossComparisonTags, type TagComparisonOption } from '@internal-types/profit_and_loss'
import { DateGroupBy } from '@schemas/reports/unifiedReport'
import { isArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { type ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { range } from '@utils/array/range'
import { toLocalDateString } from '@utils/time/timeUtils'

export function prepareFiltersBody(compareOptions: TagComparisonOption[]): ReadonlyArrayWithAtLeastOne<ProfitAndLossComparisonTags> | undefined {
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
    noneFilters[0]
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
