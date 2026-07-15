import { format } from 'date-fns'

import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  accountsOfTypes,
  buildAccountForest,
  collectLeafAccounts,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import { type PnlPeriod, resolvePnlPeriods } from '@msw/api/businesses/[business-id]/reports/unified/generators/profitAndLoss'
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
import { monthlyAmountCents } from '@fixtures/unifiedReports/deterministicAmounts'

const NAME_COLUMN_KEY = 'name'
const TOTAL_COLUMN_KEY = 'total'

const currentYearFallback = (): ReportDateRange => {
  const now = new Date()
  return { startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) }
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

const generateBusinessAccountReport = (
  params: URLSearchParams,
  type: LedgerAccountType,
  linesRoute: string,
  totalLabel: string,
): UnifiedReport => {
  const range = parseDateRangeParams(params, currentYearFallback())
  const periods = resolvePnlPeriods(range, params.get('group_by'))
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
    columns: [rowHeaderColumn(NAME_COLUMN_KEY, 'Account'), ...valueColumns(periods)],
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
  const range = parseDateRangeParams(params, currentYearFallback())

  const amountForCategory = (category: string) =>
    monthsInRange(range).reduce(
      (total, { year, monthIndex }) => total + monthlyAmountCents(`${keyPrefix}:${category}`, year, monthIndex, 2),
      0,
    )

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

const monthsInRange = ({ startDate, endDate }: ReportDateRange) => {
  const months: { year: number, monthIndex: number }[] = []
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  while (cursor <= endDate) {
    months.push({ year: cursor.getFullYear(), monthIndex: cursor.getMonth() })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months
}

export const generatePersonalExpenses = (params: URLSearchParams) =>
  generatePersonalReport(params, PERSONAL_EXPENSE_CATEGORIES, 'personal_expense', 'Total Personal Expenses')

export const generatePersonalIncome = (params: URLSearchParams) =>
  generatePersonalReport(params, PERSONAL_INCOME_CATEGORIES, 'personal_income', 'Total Personal Income')
