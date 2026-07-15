import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  type AccountNode,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
  nodeActivityCents,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  currentYearFallback,
  periodCells,
  periodValueColumns,
  type PnlPeriod,
  resolvePeriods,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  linesReportConfig,
  MOCK_REPORT_BUSINESS_ID,
  parseDateRangeParams,
  type ReportDateRange,
  reportingBasisBaseParams,
  rowHeaderColumn,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const NAME_COLUMN_KEY = 'name'

const LINES_ROUTE = 'profit-and-loss/lines'
const LINES_CONTROLS = [ReportControl.DateRange] as const

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
        reportConfig: isLeaf
          ? linesReportConfig(LINES_ROUTE, node.account, LINES_CONTROLS, reportingBasisBaseParams(params))
          : undefined,
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
  const periods = resolvePeriods(range, params.get('group_by'))

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
    columns: [rowHeaderColumn(NAME_COLUMN_KEY, 'Account'), ...periodValueColumns(periods)],
    rows,
  }
}
