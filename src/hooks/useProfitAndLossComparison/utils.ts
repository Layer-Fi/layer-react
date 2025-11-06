import { getMonth, getYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { DateRange } from '@internal-types/general'
import { range } from '@utils/array/range'
import { isArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'
import { DateRangePickerMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { ProfitAndLossComparisonTags, TagComparisonOption } from '@internal-types/profit_and_loss'
import { toLocalDateString } from '@utils/time/timeUtils'
import { ReadonlyArrayWithAtLeastOne } from '@utils/array/getArrayWithAtLeastOneOrFallback'

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
  const adjustedStartDate = startOfMonth(dateRange.startDate)

  const rawPeriods = range(0, comparePeriods).map((index) => {
    const currentPeriod = subMonths(adjustedStartDate, index)

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
  const adjustedStartDate = startOfYear(dateRange.startDate)

  const rawPeriods = range(0, comparePeriods).map((index) => {
    const currentPeriod = subYears(adjustedStartDate, index)

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
  rangeDisplayMode: DateRangePickerMode,
) {
  switch (rangeDisplayMode) {
    case 'yearPicker':
      return preparePeriodsBodyForYears(dateRange, comparePeriods)
    case 'monthPicker':
      return preparePeriodsBodyForMonths(dateRange, comparePeriods)
    default:
      return preparePeriodsBodyForDateRange(dateRange)
  }
}
