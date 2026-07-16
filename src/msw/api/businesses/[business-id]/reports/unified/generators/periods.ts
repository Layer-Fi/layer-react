import { eachMonthOfInterval, endOfMonth, format, max, min, startOfMonth } from 'date-fns'

import { Pinning, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  currencyCell,
  numericColumn,
  parseDateRangeParams,
  type ReportDateRange,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

export const TOTAL_COLUMN_KEY = 'total'

export type PnlPeriod = { columnKey: string, range: ReportDateRange }

export const currentYearFallback = (): ReportDateRange => {
  const now = new Date()
  return { startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) }
}

export const reportRangeFromParams = (params: URLSearchParams): ReportDateRange =>
  parseDateRangeParams(params, currentYearFallback())

export const monthsInRange = (range: ReportDateRange) =>
  range.startDate > range.endDate ? [] : eachMonthOfInterval({ start: range.startDate, end: range.endDate })

const monthColumnKey = (date: Date) => `month_${format(date, 'yyyy_MM')}`

/*
 * ALL_TIME collapses to a single total column; MONTH fans the requested range
 * out into one column per month, keyed so cells line up with each period.
 */
export const resolvePeriods = (range: ReportDateRange, groupBy: string | null): PnlPeriod[] => {
  if (groupBy !== 'MONTH') return [{ columnKey: TOTAL_COLUMN_KEY, range }]

  return eachMonthOfInterval({ start: range.startDate, end: range.endDate }).map(month => ({
    columnKey: monthColumnKey(month),
    range: {
      startDate: max([startOfMonth(month), range.startDate]),
      endDate: min([endOfMonth(month), range.endDate]),
    },
  }))
}

const isSingleTotal = (periods: readonly PnlPeriod[]) =>
  periods.length === 1 && periods[0].columnKey === TOTAL_COLUMN_KEY

export const periodValueColumns = (periods: readonly PnlPeriod[]): UnifiedReportColumn[] => {
  if (isSingleTotal(periods)) return [numericColumn(TOTAL_COLUMN_KEY, 'Total', Pinning.Right)]

  return [
    ...periods.map(period => numericColumn(period.columnKey, format(period.range.startDate, 'MMM yyyy'))),
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
