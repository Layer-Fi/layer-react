import { eachMonthOfInterval, eachYearOfInterval, endOfMonth, endOfYear, format, max, min, startOfMonth, startOfYear } from 'date-fns'

import { DateGroupBy, type UnifiedReportColumn } from '@schemas/reports/unifiedReport'

import {
  numericColumn,
  parseDateRangeParams,
  type ReportDateRange,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

export const TOTAL_COLUMN_KEY = 'total'

export type ReportPeriod = { columnKey: string, label: string, range: ReportDateRange }

export const currentYearFallback = (): ReportDateRange => {
  const now = new Date()
  return { startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) }
}

export const reportRangeFromParams = (params: URLSearchParams): ReportDateRange =>
  parseDateRangeParams(params, currentYearFallback())

export const monthsInRange = (range: ReportDateRange) =>
  range.startDate > range.endDate ? [] : eachMonthOfInterval({ start: range.startDate, end: range.endDate })

const clippedPeriod = (
  columnKey: string,
  label: string,
  unit: ReportDateRange,
  range: ReportDateRange,
): ReportPeriod => ({
  columnKey,
  label,
  range: {
    startDate: max([unit.startDate, range.startDate]),
    endDate: min([unit.endDate, range.endDate]),
  },
})

// Matches generateTimePeriods: a range spanning a single unit collapses to `total` alone.
export const resolvePeriods = (range: ReportDateRange, groupBy: string | null): ReportPeriod[] => {
  const totalPeriod = { columnKey: TOTAL_COLUMN_KEY, label: 'Total', range }

  const units = groupBy === DateGroupBy.Month
    ? monthsInRange(range).map(month => clippedPeriod(
      format(month, 'yyyy-MM'),
      format(month, 'MMM yyyy'),
      { startDate: startOfMonth(month), endDate: endOfMonth(month) },
      range,
    ))
    : groupBy === DateGroupBy.Year
      ? eachYearOfInterval({ start: range.startDate, end: range.endDate }).map(year => clippedPeriod(
        format(year, 'yyyy'),
        format(year, 'yyyy'),
        { startDate: startOfYear(year), endDate: endOfYear(year) },
        range,
      ))
      : []

  return units.length > 1 ? [...units, totalPeriod] : [totalPeriod]
}

export const periodColumns = (periods: readonly ReportPeriod[]): UnifiedReportColumn[] =>
  periods.map(period => numericColumn(period.columnKey, period.label))

export const periodAmounts = (
  periods: readonly ReportPeriod[],
  amountFor: (range: ReportDateRange) => number,
): Record<string, number> =>
  Object.fromEntries(periods.map(period => [period.columnKey, amountFor(period.range)]))
