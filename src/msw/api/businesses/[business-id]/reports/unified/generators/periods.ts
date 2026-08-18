import {
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  max,
  min,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns'

import { DateGroupBy, type UnifiedReportColumn } from '@schemas/features/unifiedReports/unifiedReport'

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

type UnitConfig = {
  unitsInRange: (range: ReportDateRange) => Date[]
  columnKeyFormat: string
  labelFormat: string
  startOfUnit: (date: Date) => Date
  endOfUnit: (date: Date) => Date
}

const UNIT_CONFIG_BY_GROUP_BY: Partial<Record<DateGroupBy, UnitConfig>> = {
  [DateGroupBy.Month]: {
    unitsInRange: monthsInRange,
    columnKeyFormat: 'yyyy-MM',
    labelFormat: 'MMM yyyy',
    startOfUnit: startOfMonth,
    endOfUnit: endOfMonth,
  },
  [DateGroupBy.Quarter]: {
    unitsInRange: range => range.startDate > range.endDate ? [] : eachQuarterOfInterval({ start: range.startDate, end: range.endDate }),
    columnKeyFormat: 'yyyy-\'Q\'Q',
    labelFormat: '\'Q\'Q yyyy',
    startOfUnit: startOfQuarter,
    endOfUnit: endOfQuarter,
  },
  [DateGroupBy.Year]: {
    unitsInRange: range => range.startDate > range.endDate ? [] : eachYearOfInterval({ start: range.startDate, end: range.endDate }),
    columnKeyFormat: 'yyyy',
    labelFormat: 'yyyy',
    startOfUnit: startOfYear,
    endOfUnit: endOfYear,
  },
}

// Matches generateTimePeriods: a range spanning a single unit collapses to `total` alone.
export const resolvePeriods = (range: ReportDateRange, groupBy: string | null): ReportPeriod[] => {
  const totalPeriod = { columnKey: TOTAL_COLUMN_KEY, label: 'Total', range }

  const config = groupBy !== null ? UNIT_CONFIG_BY_GROUP_BY[groupBy as DateGroupBy] : undefined

  const units = config === undefined
    ? []
    : config.unitsInRange(range).map(unit => clippedPeriod(
      format(unit, config.columnKeyFormat),
      format(unit, config.labelFormat),
      { startDate: config.startOfUnit(unit), endDate: config.endOfUnit(unit) },
      range,
    ))

  return units.length > 1 ? [...units, totalPeriod] : [totalPeriod]
}

export const periodColumns = (periods: readonly ReportPeriod[]): UnifiedReportColumn[] =>
  periods.map(period => numericColumn(period.columnKey, period.label))

export const periodAmounts = (
  periods: readonly ReportPeriod[],
  amountFor: (range: ReportDateRange) => number,
): Record<string, number> =>
  Object.fromEntries(periods.map(period => [period.columnKey, amountFor(period.range)]))
