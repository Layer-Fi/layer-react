import { getMonth, getYear, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import { DateRange } from '../../types'
import { range } from '../../utils/array/range'
import { isArrayWithAtLeastOne } from '../../utils/array/getArrayWithAtLeastOneOrFallback'
import { DateRangePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { TagComparisonOption } from '../../types/profit_and_loss'

export function prepareFiltersBody(compareOptions: TagComparisonOption[]) {
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

export function preparePeriodsBody(
  dateRange: DateRange, comparePeriods: number, rangeDisplayMode: DateRangePickerMode,
) {
  switch (rangeDisplayMode) {
    case 'yearPicker':
      return preparePeriodsBodyForYears(dateRange, comparePeriods)
    default:
      return preparePeriodsBodyForMonths(dateRange, comparePeriods)
  }
}

export function preparePeriodsBodyForMonths(dateRange: DateRange, comparePeriods: number) {
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

export function preparePeriodsBodyForYears(dateRange: DateRange, comparePeriods: number) {
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
