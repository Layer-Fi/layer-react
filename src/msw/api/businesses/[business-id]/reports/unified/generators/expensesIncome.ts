import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  currentYearFallback,
  periodCells,
  periodValueColumns,
  resolvePeriods,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  currencyCell,
  linesReportConfig,
  MOCK_REPORT_BUSINESS_ID,
  numericColumn,
  parseDateRangeParams,
  rowHeaderColumn,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { sumAmountCentsInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const NAME_COLUMN_KEY = 'name'
const TOTAL_COLUMN_KEY = 'total'

const generateBusinessAccountReport = (
  params: URLSearchParams,
  type: LedgerAccountType,
  linesRoute: string,
  totalLabel: string,
): UnifiedReport => {
  const range = parseDateRangeParams(params, currentYearFallback())
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

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [rowHeaderColumn(NAME_COLUMN_KEY, 'Account'), ...periodValueColumns(periods)],
    rows,
  }
}

export const generateBusinessExpenses = (params: URLSearchParams) =>
  generateBusinessAccountReport(params, LedgerAccountType.Expense, 'profit-and-loss/lines', 'Total Expenses')

export const generateBusinessIncome = (params: URLSearchParams) =>
  generateBusinessAccountReport(params, LedgerAccountType.Revenue, 'profit-and-loss/lines', 'Total Income')

const PERSONAL_EXPENSE_CATEGORIES = ['Groceries', 'Rent', 'Personal Care', 'Health & Wellness', 'Entertainment', 'Dining Out']
const PERSONAL_INCOME_CATEGORIES = ['W-2 Salary', 'Interest Income', 'Dividends', 'Gifts']

const generatePersonalReport = (
  params: URLSearchParams,
  categories: readonly string[],
  keyPrefix: string,
  totalLabel: string,
): UnifiedReport => {
  const { startDate, endDate } = parseDateRangeParams(params, currentYearFallback())

  // Sum the shared entry stream over the exact range so mid-month bounds are respected, matching account-backed reports.
  const amountForCategory = (category: string) =>
    sumAmountCentsInRange(`${keyPrefix}:${category}`, startDate, endDate, { magnitude: 2 })

  const rows: UnifiedReportRow[] = categories.map(category => ({
    rowKey: category,
    cells: {
      [NAME_COLUMN_KEY]: textCell(category),
      [TOTAL_COLUMN_KEY]: currencyCell(amountForCategory(category)),
    },
  }))

  rows.push({
    rowKey: `total_${keyPrefix}`,
    cells: {
      [NAME_COLUMN_KEY]: textCell(totalLabel, { bold: true }),
      [TOTAL_COLUMN_KEY]: currencyCell(
        categories.reduce((total, category) => total + amountForCategory(category), 0),
        { bold: true },
      ),
    },
  })

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [rowHeaderColumn(NAME_COLUMN_KEY, 'Category'), numericColumn(TOTAL_COLUMN_KEY, 'Total', Pinning.Right)],
    rows,
  }
}

export const generatePersonalExpenses = (params: URLSearchParams) =>
  generatePersonalReport(params, PERSONAL_EXPENSE_CATEGORIES, 'personal_expense', 'Total Personal Expenses')

export const generatePersonalIncome = (params: URLSearchParams) =>
  generatePersonalReport(params, PERSONAL_INCOME_CATEGORIES, 'personal_income', 'Total Personal Income')
