import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  leafAccountsOfTypes,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  reportRangeFromParams,
  resolvePeriods,
  TOTAL_COLUMN_KEY,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { linesReportConfig } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { generateTableReport } from '@msw/api/businesses/[business-id]/reports/unified/generators/tableReport'

const generateBusinessAccountReport = (
  params: URLSearchParams,
  type: LedgerAccountType,
  linesRoute: string,
  totalLabel: string,
): UnifiedReport => {
  const range = reportRangeFromParams(params)
  const periods = resolvePeriods(range, params.get('group_by'))
  const leaves = leafAccountsOfTypes([type])

  return generateTableReport({
    rowHeader: {
      columnKey: 'name',
      displayName: 'Account',
      label: account => account.name,
      reportConfig: account => linesReportConfig(linesRoute, account, [ReportControl.DateRange]),
    },
    rowKey: account => account.accountId,
    items: leaves,
    valueColumns: [
      ...periods.filter(period => period.columnKey !== TOTAL_COLUMN_KEY).map(period => ({
        columnKey: period.columnKey,
        displayName: period.label,
        value: (account: (typeof leaves)[number]) => accountActivityCents(account, period.range, params),
      })),
      {
        columnKey: TOTAL_COLUMN_KEY,
        displayName: 'Total',
        value: account => accountActivityCents(account, range, params),
        pinning: Pinning.Right,
      },
    ],
    total: { rowKey: `total_${totalLabel.toLowerCase().replaceAll(' ', '_')}`, label: totalLabel },
  })
}

export const generateBusinessExpenses = (params: URLSearchParams) =>
  generateBusinessAccountReport(params, LedgerAccountType.Expense, 'profit-and-loss/lines', 'Total Expenses')

export const generateBusinessIncome = (params: URLSearchParams) =>
  generateBusinessAccountReport(params, LedgerAccountType.Revenue, 'profit-and-loss/lines', 'Total Income')
