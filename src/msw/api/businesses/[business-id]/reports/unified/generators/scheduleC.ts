import { getYear } from 'date-fns'

import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  accountsOfTypes,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  currencyCell,
  linesReportConfig,
  MOCK_REPORT_BUSINESS_ID,
  numericColumn,
  type ReportDateRange,
  rowHeaderColumn,
  textCell,
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

const lineRow = (
  lineNumber: string,
  label: string,
  amount: number,
  account?: SingleChartAccountType,
): UnifiedReportRow => ({
  rowKey: `line_${lineNumber}`,
  cells: {
    [LINE_COLUMN_KEY]: textCell(`Line ${lineNumber}: ${label}`, {
      reportConfig: account ? linesReportConfig(LINES_ROUTE, account, [ReportControl.Date]) : undefined,
    }),
    [AMOUNT_COLUMN_KEY]: currencyCell(amount),
  },
})

const totalRow = (lineNumber: string, label: string, amount: number): UnifiedReportRow => ({
  rowKey: `line_${lineNumber}`,
  cells: {
    [LINE_COLUMN_KEY]: textCell(`Line ${lineNumber}: ${label}`, { bold: true }),
    [AMOUNT_COLUMN_KEY]: currencyCell(amount, { bold: true }),
  },
})

export const generateScheduleC = (params: URLSearchParams): UnifiedReport => {
  const range = yearRange(params)
  const revenueAccounts = accountsOfTypes([LedgerAccountType.Revenue])
  const expenseAccounts = accountsOfTypes([LedgerAccountType.Expense])

  const salesAccount = findByStableName(revenueAccounts, 'SALES')
  const grossReceipts = revenueAccounts.reduce(
    (total, account) => total + accountActivityCents(account, range, params),
    0,
  )

  const expenseLineRows = EXPENSE_LINES.map((line) => {
    const account = findByStableName(expenseAccounts, line.stableName)
    const amount = account ? accountActivityCents(account, range, params) : 0
    return { row: lineRow(line.lineNumber, line.label, amount, account), amount }
  })

  const totalExpenses = expenseLineRows.reduce((total, { amount }) => total + amount, 0)

  const rows: UnifiedReportRow[] = [
    lineRow('1', 'Gross receipts or sales', grossReceipts, salesAccount),
    totalRow('7', 'Gross income', grossReceipts),
    ...expenseLineRows.map(({ row }) => row),
    totalRow('28', 'Total expenses', totalExpenses),
    totalRow('31', 'Net profit or (loss)', grossReceipts - totalExpenses),
  ]

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [
      rowHeaderColumn(LINE_COLUMN_KEY, 'Schedule C Line'),
      numericColumn(AMOUNT_COLUMN_KEY, 'Amount', Pinning.Right),
    ],
    rows,
  }
}
