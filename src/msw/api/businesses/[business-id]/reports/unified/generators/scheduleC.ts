import { getYear } from 'date-fns'
import { sumBy } from 'lodash-es'

import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type ReportConfig } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  accountsOfTypes,
  leafAccountsOfTypes,
  sumActivityCents,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  isoDate,
  labeledCurrencyRowFor,
  linesReportConfig,
  numericColumn,
  type ReportDateRange,
  rowHeaderColumn,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const LINE_COLUMN_KEY = 'line'
const AMOUNT_COLUMN_KEY = 'amount'

const LINES_ROUTE = 'tax/schedule-c/lines'

// Schedule C expense lines mapped to the chart-of-accounts stable name that feeds them.
const EXPENSE_LINES: ReadonlyArray<{ lineNumber: string, label: string, stableName: string }> = [
  { lineNumber: '8', label: 'Advertising', stableName: 'MARKETING' },
  { lineNumber: '17', label: 'Legal and professional services', stableName: 'PROFESSIONAL_SERVICES' },
  { lineNumber: '18', label: 'Office expense', stableName: 'OFFICE_EXPENSES' },
  { lineNumber: '20b', label: 'Rent or lease (other business property)', stableName: 'RENT' },
  { lineNumber: '22', label: 'Supplies', stableName: 'SOFTWARE' },
  { lineNumber: '24a', label: 'Travel', stableName: 'TRAVEL' },
  { lineNumber: '24b', label: 'Deductible meals', stableName: 'MEALS' },
  { lineNumber: '25', label: 'Utilities', stableName: 'UTILITIES' },
  { lineNumber: '26', label: 'Wages', stableName: 'PAYROLL_REGULAR_WAGES' },
  { lineNumber: '27a', label: 'Other expenses (interest, fees)', stableName: 'INTEREST_EXPENSE' },
]

const yearRange = (params: URLSearchParams): ReportDateRange => {
  const year = Number(params.get('year')) || getYear(new Date())
  return { startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31) }
}

const findByStableName = (accounts: readonly SingleChartAccountType[], stableName: string) =>
  accounts.find(account => account.stableName === stableName)

const scheduleCRow = labeledCurrencyRowFor(LINE_COLUMN_KEY, AMOUNT_COLUMN_KEY)

const lineRow = (lineNumber: string, label: string, amount: number, reportConfig?: ReportConfig) =>
  scheduleCRow(`line_${lineNumber}`, `Line ${lineNumber}: ${label}`, amount, { reportConfig })

/*
 * Schedule C uses a year control, but the detail route is date-range based.
 * Baking the calendar year into base parameters (with no controls) makes the
 * drill-down cover the same window as the parent line, so totals reconcile.
 */
const scheduleCLinesConfig = (account: SingleChartAccountType, range: ReportDateRange): ReportConfig =>
  linesReportConfig(LINES_ROUTE, account, [], { start_date: isoDate(range.startDate), end_date: isoDate(range.endDate) })

const totalRow = (lineNumber: string, label: string, amount: number) =>
  scheduleCRow(`line_${lineNumber}`, `Line ${lineNumber}: ${label}`, amount, { bold: true })

export const generateScheduleC = (params: URLSearchParams): UnifiedReport => {
  const range = yearRange(params)
  const expenseAccounts = accountsOfTypes([LedgerAccountType.Expense])

  // Gross receipts aggregates every revenue leaf account, so it has no single-account drill-down.
  const grossReceipts = sumActivityCents(leafAccountsOfTypes([LedgerAccountType.Revenue]), range, params)

  const expenseLineRows = EXPENSE_LINES.map((line) => {
    const account = findByStableName(expenseAccounts, line.stableName)
    const amount = account ? accountActivityCents(account, range, params) : 0
    const reportConfig = account ? scheduleCLinesConfig(account, range) : undefined
    return { row: lineRow(line.lineNumber, line.label, amount, reportConfig), amount }
  })

  const totalExpenses = sumBy(expenseLineRows, ({ amount }) => amount)

  const rows: UnifiedReportRow[] = [
    lineRow('1', 'Gross receipts or sales', grossReceipts),
    totalRow('7', 'Gross income', grossReceipts),
    ...expenseLineRows.map(({ row }) => row),
    totalRow('28', 'Total expenses', totalExpenses),
    totalRow('31', 'Net profit or (loss)', grossReceipts - totalExpenses),
  ]

  return unifiedReport(
    [rowHeaderColumn(LINE_COLUMN_KEY, 'Schedule C Line'), numericColumn(AMOUNT_COLUMN_KEY, 'Amount', Pinning.Right)],
    rows,
  )
}
