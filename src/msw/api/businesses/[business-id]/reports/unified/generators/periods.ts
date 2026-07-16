import { eachMonthOfInterval, eachYearOfInterval, endOfMonth, endOfYear, format, max, min, startOfMonth, startOfYear } from 'date-fns'

import { DateGroupBy, Pinning, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  currencyCell,
  numericColumn,
  parseDateRangeParams,
  type ReportDateRange,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

export const TOTAL_COLUMN_KEY = 'total'

export type PnlPeriod = { columnKey: string, label: string, range: ReportDateRange }

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
): PnlPeriod => ({
  columnKey,
  label,
  range: {
    startDate: max([unit.startDate, range.startDate]),
    endDate: min([unit.endDate, range.endDate]),
  },
})

/*
 * ALL_TIME collapses to a single total column; MONTH and YEAR fan the
 * requested range out into one column per unit, keyed so cells line up.
 */
export const resolvePeriods = (range: ReportDateRange, groupBy: string | null): PnlPeriod[] => {
  switch (groupBy) {
    case DateGroupBy.Month:
      return eachMonthOfInterval({ start: range.startDate, end: range.endDate }).map(month => clippedPeriod(
        `month_${format(month, 'yyyy_MM')}`,
        format(month, 'MMM yyyy'),
        { startDate: startOfMonth(month), endDate: endOfMonth(month) },
        range,
      ))
    case DateGroupBy.Year:
      return eachYearOfInterval({ start: range.startDate, end: range.endDate }).map(year => clippedPeriod(
        `year_${format(year, 'yyyy')}`,
        format(year, 'yyyy'),
        { startDate: startOfYear(year), endDate: endOfYear(year) },
        range,
      ))
    default:
      return [{ columnKey: TOTAL_COLUMN_KEY, label: 'Total', range }]
  }
}

const isSingleTotal = (periods: readonly PnlPeriod[]) =>
  periods.length === 1 && periods[0].columnKey === TOTAL_COLUMN_KEY

export const periodValueColumns = (periods: readonly PnlPeriod[]): UnifiedReportColumn[] => {
  if (isSingleTotal(periods)) return [numericColumn(TOTAL_COLUMN_KEY, 'Total', Pinning.Right)]

  return [
    ...periods.map(period => numericColumn(period.columnKey, period.label)),
    numericColumn(TOTAL_COLUMN_KEY, 'Total', Pinning.Right),
  ]
}

export const periodCells = (
  amountFor: (range: ReportDateRange) => number,
  periods: readonly PnlPeriod[],
  bold: boolean = false,
): UnifiedReportRow['cells'] => {
  const cells: Record<string, ReturnType<typeof currencyCell>> = {}
  let total = 0

  periods.forEach((period) => {
    const amount = amountFor(period.range)
    total += amount
    if (period.columnKey !== TOTAL_COLUMN_KEY) cells[period.columnKey] = currencyCell(amount, { bold })
  })

  cells[TOTAL_COLUMN_KEY] = currencyCell(total, { bold })
  return cells
}
