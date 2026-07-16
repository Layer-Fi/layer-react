import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountForestRows,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
  nodeActivityCents,
  sumActivityCents,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  periodCells,
  periodValueColumns,
  type PnlPeriod,
  reportRangeFromParams,
  resolvePeriods,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  linesReportConfig,
  type ReportDateRange,
  reportingBasisBaseParams,
  rowHeaderColumn,
  textCell,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const NAME_COLUMN_KEY = 'name'

const LINES_ROUTE = 'profit-and-loss/lines'
const LINES_CONTROLS = [ReportControl.DateRange] as const

const sectionTotalRow = (
  rowKey: string,
  label: string,
  amountFor: (range: ReportDateRange) => number,
  periods: readonly PnlPeriod[],
): UnifiedReportRow => ({
  rowKey,
  cells: {
    [NAME_COLUMN_KEY]: textCell(label, { bold: true }),
    ...periodCells(amountFor, periods, { bold: true }),
  },
})

export const generateProfitAndLoss = (params: URLSearchParams): UnifiedReport => {
  const range = reportRangeFromParams(params)
  const periods = resolvePeriods(range, params.get('group_by'))

  const isCogs = (account: SingleChartAccountType) => account.accountSubtype?.value === 'COGS'
  const expenseAccounts = accountsOfTypes([LedgerAccountType.Expense])

  const revenueForest = buildAccountForest(accountsOfTypes([LedgerAccountType.Revenue]))
  const cogsForest = buildAccountForest(expenseAccounts.filter(isCogs))
  const operatingForest = buildAccountForest(expenseAccounts.filter(account => !isCogs(account)))

  const revenueLeaves = collectLeafAccounts(revenueForest)
  const cogsLeaves = collectLeafAccounts(cogsForest)
  const operatingLeaves = collectLeafAccounts(operatingForest)

  const revenueTotal = (r: ReportDateRange) => sumActivityCents(revenueLeaves, r, params)
  const cogsTotal = (r: ReportDateRange) => sumActivityCents(cogsLeaves, r, params)
  const expensesTotal = (r: ReportDateRange) => sumActivityCents(operatingLeaves, r, params)

  const sectionRows = (forest: ReturnType<typeof buildAccountForest>) => accountForestRows(forest, {
    nameColumnKey: NAME_COLUMN_KEY,
    valueCells: (node, isLeaf) => periodCells(r => nodeActivityCents(node, r, params), periods, {
      reportConfig: isLeaf
        ? linesReportConfig(LINES_ROUTE, node.account, LINES_CONTROLS, reportingBasisBaseParams(params))
        : undefined,
    }),
  })

  const rows: UnifiedReportRow[] = [
    ...sectionRows(revenueForest),
    sectionTotalRow('total_revenue', 'Total Revenue', revenueTotal, periods),
    ...sectionRows(cogsForest),
    sectionTotalRow('total_cogs', 'Total Cost of Goods Sold', cogsTotal, periods),
    sectionTotalRow('gross_profit', 'Gross Profit', r => revenueTotal(r) - cogsTotal(r), periods),
    ...sectionRows(operatingForest),
    sectionTotalRow('total_expenses', 'Total Expenses', expensesTotal, periods),
    sectionTotalRow('net_profit', 'Net Profit', r => revenueTotal(r) - cogsTotal(r) - expensesTotal(r), periods),
  ]

  return unifiedReport([rowHeaderColumn(NAME_COLUMN_KEY, 'Account'), ...periodValueColumns(periods)], rows)
}
