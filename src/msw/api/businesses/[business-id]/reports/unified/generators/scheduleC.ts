import { getYear } from 'date-fns'
import { sumBy } from 'lodash-es'

import { Pinning } from '@internal-types/utility/table'
import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type ReportConfig } from '@schemas/reports/reportConfig'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  accountActivityCents,
  accountsOfTypes,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import { TOTAL_COLUMN_KEY } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  currencyCell,
  emptyCell,
  headerColumn,
  isoDate,
  linesReportConfig,
  numericColumn,
  type ReportDateRange,
  textCell,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const LINES_ROUTE = 'tax/schedule-c/lines'

type BoxLine = { lineNumber: string, lineName: string, stableName: string }

// Schedule C boxes mapped to the chart-of-accounts stable name that feeds them.
const PART_I_INCOME: BoxLine[] = [
  { lineNumber: '1', lineName: 'Gross receipts or sales', stableName: 'SALES' },
  { lineNumber: '2', lineName: 'Returns and allowances', stableName: 'RETURNS_AND_ALLOWANCES' },
  { lineNumber: '6', lineName: 'Other income', stableName: 'UNCATEGORIZED_REVENUE' },
]

const PART_II_EXPENSES: BoxLine[] = [
  { lineNumber: '8', lineName: 'Advertising', stableName: 'MARKETING' },
  { lineNumber: '17', lineName: 'Legal and professional services', stableName: 'PROFESSIONAL_SERVICES' },
  { lineNumber: '18', lineName: 'Office expense', stableName: 'OFFICE_EXPENSES' },
  { lineNumber: '20b', lineName: 'Rent or lease (other business property)', stableName: 'RENT' },
  { lineNumber: '22', lineName: 'Supplies', stableName: 'SOFTWARE' },
  { lineNumber: '24a', lineName: 'Travel', stableName: 'TRAVEL' },
  { lineNumber: '24b', lineName: 'Deductible meals', stableName: 'MEALS' },
  { lineNumber: '25', lineName: 'Utilities', stableName: 'UTILITIES' },
  { lineNumber: '26', lineName: 'Wages', stableName: 'PAYROLL_REGULAR_WAGES' },
]

const PART_III_COGS: BoxLine[] = [
  { lineNumber: '36', lineName: 'Purchases less cost of items withdrawn for personal use', stableName: 'COST_OF_GOODS_SOLD' },
]

const PART_V_OTHER_EXPENSES: BoxLine[] = [
  { lineNumber: '48a', lineName: 'Interest and bank fees', stableName: 'INTEREST_EXPENSE' },
]

const SYNTHETIC_LINES = {
  line3: { rowKey: 'line_3_net_receipts', lineNumber: '3', name: 'Subtract line 2 from line 1', bold: false },
  line4: { rowKey: 'line_4_cogs', lineNumber: '4', name: 'Cost of goods sold (from line 42)', bold: false },
  line5: { rowKey: 'line_5_gross_profit', lineNumber: '5', name: 'Gross profit', bold: false },
  line7: { rowKey: 'line_7_gross_income', lineNumber: '7', name: 'Gross income', bold: true },
  line27b: { rowKey: 'line_27b_from_line_48', lineNumber: '27b', name: 'Other expenses (from line 48)', bold: false },
  line28: { rowKey: 'line_28_total_expenses', lineNumber: '28', name: 'Total expenses', bold: true },
  line29: { rowKey: 'line_29_tentative_profit', lineNumber: '29', name: 'Tentative profit or (loss)', bold: false },
  line31: { rowKey: 'line_31_net_profit', lineNumber: '31', name: 'Net profit or (loss)', bold: true },
  line42: { rowKey: 'line_42_cogs', lineNumber: '42', name: 'Cost of goods sold', bold: true },
  line48: { rowKey: 'line_48_other_expenses', lineNumber: '48', name: 'Total other expenses', bold: true },
} as const

const yearRange = (params: URLSearchParams): ReportDateRange => {
  const year = Number(params.get('year')) || getYear(new Date())
  return { startDate: new Date(year, 0, 1), endDate: new Date(year, 11, 31) }
}

// Schedule C is year-controlled but its detail route is date-range based, so bake the year in.
const linesConfig = (account: SingleChartAccountType, range: ReportDateRange): ReportConfig =>
  linesReportConfig(LINES_ROUTE, account, [], { start_date: isoDate(range.startDate), end_date: isoDate(range.endDate) })

const boxRowKey = (lineNumber: string) => `line_${lineNumber.toLowerCase().replaceAll(' ', '_')}`

export const generateScheduleC = (params: URLSearchParams): UnifiedReport => {
  const range = yearRange(params)
  const accounts = [
    ...accountsOfTypes([LedgerAccountType.Revenue]),
    ...accountsOfTypes([LedgerAccountType.Expense]),
  ]

  const amountFor = (box: BoxLine) => {
    const account = accounts.find(candidate => candidate.stableName === box.stableName)
    if (!account) return { amount: 0, reportConfig: undefined }

    return {
      amount: Math.abs(accountActivityCents(account, range, params)),
      reportConfig: linesConfig(account, range),
    }
  }

  const amounts = new Map<string, number>()
  const leafRow = (box: BoxLine, isOtherExpense: boolean = false): UnifiedReportRow => {
    const { amount, reportConfig } = amountFor(box)
    amounts.set(box.lineNumber, amount)

    return {
      rowKey: boxRowKey(box.lineNumber),
      cells: {
        account: textCell(isOtherExpense ? box.lineName : `${box.lineNumber}. ${box.lineName}`),
        [TOTAL_COLUMN_KEY]: currencyCell(amount, { reportConfig }),
      },
    }
  }

  const partIRows = PART_I_INCOME.map(box => leafRow(box))
  const partIIRows = PART_II_EXPENSES.map(box => leafRow(box))
  const partIIIRows = PART_III_COGS.map(box => leafRow(box))
  const partVRows = PART_V_OTHER_EXPENSES.map(box => leafRow(box, true))

  const amountOf = (lineNumber: string) => amounts.get(lineNumber) ?? 0
  const sumOf = (boxes: readonly BoxLine[]) => sumBy(boxes, box => amountOf(box.lineNumber))

  const line42 = sumOf(PART_III_COGS)
  const line48 = sumOf(PART_V_OTHER_EXPENSES)
  const line3 = amountOf('1') - amountOf('2')
  const line5 = line3 - line42
  const line7 = line5 + amountOf('6')
  const line28 = sumOf(PART_II_EXPENSES) + line48
  const line29 = line7 - line28

  const syntheticRow = (
    line: (typeof SYNTHETIC_LINES)[keyof typeof SYNTHETIC_LINES],
    amount: number,
  ): UnifiedReportRow => ({
    rowKey: line.rowKey,
    cells: {
      account: textCell(`${line.lineNumber}. ${line.name}`, { bold: line.bold }),
      [TOTAL_COLUMN_KEY]: currencyCell(amount, { bold: line.bold }),
    },
  })

  const partRow = (rowKey: string, displayName: string, rows: UnifiedReportRow[]): UnifiedReportRow => ({
    rowKey,
    cells: { account: textCell(displayName, { bold: true }), [TOTAL_COLUMN_KEY]: emptyCell() },
    rows,
  })

  return unifiedReport(
    [
      headerColumn('account', { isRowHeader: true, pinning: Pinning.Left }),
      numericColumn(TOTAL_COLUMN_KEY, String(range.startDate.getFullYear())),
    ],
    [
      partRow('part_i_income', 'Part I - Income', [
        ...partIRows.slice(0, 2),
        syntheticRow(SYNTHETIC_LINES.line3, line3),
        syntheticRow(SYNTHETIC_LINES.line4, line42),
        syntheticRow(SYNTHETIC_LINES.line5, line5),
        ...partIRows.slice(2),
        syntheticRow(SYNTHETIC_LINES.line7, line7),
      ]),
      partRow('part_ii_expenses', 'Part II - Expenses', [
        ...partIIRows,
        syntheticRow(SYNTHETIC_LINES.line27b, line48),
        syntheticRow(SYNTHETIC_LINES.line28, line28),
        syntheticRow(SYNTHETIC_LINES.line29, line29),
        syntheticRow(SYNTHETIC_LINES.line31, line29),
      ]),
      partRow('part_iii_cogs', 'Part III - Cost of Goods Sold', [
        ...partIIIRows,
        syntheticRow(SYNTHETIC_LINES.line42, line42),
      ]),
      partRow('part_v_other_expenses', 'Part V - Other Expenses', [
        ...partVRows,
        syntheticRow(SYNTHETIC_LINES.line48, line48),
      ]),
    ],
  )
}
