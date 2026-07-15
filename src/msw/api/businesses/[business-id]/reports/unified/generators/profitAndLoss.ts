import { eachMonthOfInterval, format } from 'date-fns'

import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  type AccountNode,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
  nodeActivityCents,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  currencyCell,
  linesReportConfig,
  MOCK_REPORT_BUSINESS_ID,
  numericColumn,
  parseDateRangeParams,
  type ReportDateRange,
  rowHeaderColumn,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const NAME_COLUMN_KEY = 'name'
const TOTAL_COLUMN_KEY = 'total'

const LINES_ROUTE = 'profit-and-loss/lines'
const LINES_CONTROLS = [ReportControl.DateRange] as const

export type PnlPeriod = { columnKey: string, range: ReportDateRange }

const monthColumnKey = (date: Date) => `month_${format(date, 'yyyy_MM')}`

const currentYearFallback = (): ReportDateRange => {
  const now = new Date()
  return { startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) }
}

/*
 * ALL_TIME collapses to a single total column; MONTH fans the requested range
 * out into one column per month, keyed so cells line up with each period.
 */
export const resolvePnlPeriods = (range: ReportDateRange, groupBy: string | null): PnlPeriod[] => {
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

const valueColumns = (periods: readonly PnlPeriod[]): UnifiedReportColumn[] => {
  if (isSingleTotal(periods)) return [numericColumn(TOTAL_COLUMN_KEY, 'Total', Pinning.Right)]

  return [
    ...periods.map(period => numericColumn(period.columnKey, format(period.range.startDate, 'MMM yyyy'))),
    numericColumn(TOTAL_COLUMN_KEY, 'Total', Pinning.Right),
  ]
}

const periodCells = (
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

const accountRow = (
  node: AccountNode,
  periods: readonly PnlPeriod[],
  params: URLSearchParams,
): UnifiedReportRow => {
  const isLeaf = node.children.length === 0

  return {
    rowKey: node.account.accountId,
    cells: {
      [NAME_COLUMN_KEY]: textCell(node.account.name, {
        reportConfig: isLeaf ? linesReportConfig(LINES_ROUTE, node.account, LINES_CONTROLS) : undefined,
      }),
      ...periodCells(range => isLeaf
        ? accountActivityCents(node.account, range, params)
        : nodeActivityCents(node, range, params), periods),
    },
    ...(isLeaf ? {} : { rows: node.children.map(child => accountRow(child, periods, params)) }),
  }
}

const sectionTotalRow = (
  rowKey: string,
  label: string,
  amountFor: (range: ReportDateRange) => number,
  periods: readonly PnlPeriod[],
): UnifiedReportRow => ({
  rowKey,
  cells: {
    [NAME_COLUMN_KEY]: textCell(label, { bold: true }),
    ...periodCells(amountFor, periods, true),
  },
})

const sumLeaves = (
  leaves: readonly SingleChartAccountType[],
  range: ReportDateRange,
  params: URLSearchParams,
) => leaves.reduce((total, account) => total + accountActivityCents(account, range, params), 0)

export const generateProfitAndLoss = (params: URLSearchParams): UnifiedReport => {
  const range = parseDateRangeParams(params, currentYearFallback())
  const periods = resolvePnlPeriods(range, params.get('group_by'))

  const revenueForest = buildAccountForest(accountsOfTypes([LedgerAccountType.Revenue]))
  const expenseForest = buildAccountForest(accountsOfTypes([LedgerAccountType.Expense]))

  const revenueLeaves = collectLeafAccounts(revenueForest)
  const expenseLeaves = collectLeafAccounts(expenseForest)
  const cogsLeaves = expenseLeaves.filter(account => account.accountSubtype?.value === 'COGS')
  const operatingLeaves = expenseLeaves.filter(account => account.accountSubtype?.value !== 'COGS')

  const revenueTotal = (r: ReportDateRange) => sumLeaves(revenueLeaves, r, params)
  const cogsTotal = (r: ReportDateRange) => sumLeaves(cogsLeaves, r, params)
  const expensesTotal = (r: ReportDateRange) => sumLeaves(operatingLeaves, r, params)

  const rows: UnifiedReportRow[] = [
    ...revenueForest.map(node => accountRow(node, periods, params)),
    sectionTotalRow('total_revenue', 'Total Revenue', revenueTotal, periods),
    sectionTotalRow('gross_profit', 'Gross Profit', r => revenueTotal(r) - cogsTotal(r), periods),
    ...expenseForest.map(node => accountRow(node, periods, params)),
    sectionTotalRow('total_expenses', 'Total Expenses', r => cogsTotal(r) + expensesTotal(r), periods),
    sectionTotalRow('net_profit', 'Net Profit', r => revenueTotal(r) - cogsTotal(r) - expensesTotal(r), periods),
  ]

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [rowHeaderColumn(NAME_COLUMN_KEY, 'Account'), ...valueColumns(periods)],
    rows,
  }
}
