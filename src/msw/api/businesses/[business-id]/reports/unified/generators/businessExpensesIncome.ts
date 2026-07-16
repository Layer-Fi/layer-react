import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  periodCells,
  periodValueColumns,
  reportRangeFromParams,
  resolvePeriods,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  linesReportConfig,
  rowHeaderColumn,
  textCell,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const NAME_COLUMN_KEY = 'name'

const generateBusinessAccountReport = (
  params: URLSearchParams,
  type: LedgerAccountType,
  linesRoute: string,
  totalLabel: string,
): UnifiedReport => {
  const range = reportRangeFromParams(params)
  const periods = resolvePeriods(range, params.get('group_by'))
  const leaves = collectLeafAccounts(buildAccountForest(accountsOfTypes([type])))

  const rows: UnifiedReportRow[] = leaves.map(account => ({
    rowKey: account.accountId,
    cells: {
      [NAME_COLUMN_KEY]: textCell(account.name, {
        reportConfig: linesReportConfig(linesRoute, account, [ReportControl.DateRange]),
      }),
      ...periodCells(r => accountActivityCents(account, r, params), periods),
    },
  }))

  rows.push({
    rowKey: `total_${totalLabel.toLowerCase().replaceAll(' ', '_')}`,
    cells: {
      [NAME_COLUMN_KEY]: textCell(totalLabel, { bold: true }),
      ...periodCells(
        r => leaves.reduce((total, account) => total + accountActivityCents(account, r, params), 0),
        periods,
        true,
      ),
    },
  })

  return unifiedReport([rowHeaderColumn(NAME_COLUMN_KEY, 'Account'), ...periodValueColumns(periods)], rows)
}

export const generateBusinessExpenses = (params: URLSearchParams) =>
  generateBusinessAccountReport(params, LedgerAccountType.Expense, 'profit-and-loss/lines', 'Total Expenses')

export const generateBusinessIncome = (params: URLSearchParams) =>
  generateBusinessAccountReport(params, LedgerAccountType.Revenue, 'profit-and-loss/lines', 'Total Income')
