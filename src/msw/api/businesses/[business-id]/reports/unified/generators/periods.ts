import { eachMonthOfInterval, format } from 'date-fns'

import { Pinning, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  currencyCell,
  numericColumn,
  type ReportDateRange,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

export const TOTAL_COLUMN_KEY = 'total'

export type PnlPeriod = { columnKey: string, range: ReportDateRange }

export const currentYearFallback = (): ReportDateRange => {
  const now = new Date()
  return { startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) }
}

const monthColumnKey = (date: Date) => `month_${format(date, 'yyyy_MM')}`

/*
 * ALL_TIME collapses to a single total column; MONTH fans the requested range
 * out into one column per month, keyed so cells line up with each period.
 */
export const resolvePeriods = (range: ReportDateRange, groupBy: string | null): PnlPeriod[] => {
  if (groupBy !== 'MONTH') return [{ columnKey: TOTAL_COLUMN_KEY, range }]

  return eachMonthOfInterval({ start: range.startDate, end: range.endDate }).map(monthStart => ({
    columnKey: monthColumnKey(monthStart),
    range: {
      startDate: monthStart,
      endDate: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0),
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
