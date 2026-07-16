import { subDays, subMonths } from 'date-fns'

import { Pinning, type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import { netIncomeInRange } from '@msw/api/businesses/[business-id]/reports/unified/generators/balances'
import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  labeledCurrencyRowFor,
  numericColumn,
  rowHeaderColumn,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { sumAmountCentsInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const NAME_COLUMN_KEY = 'name'
const AMOUNT_COLUMN_KEY = 'amount'

const cashflowRow = labeledCurrencyRowFor(NAME_COLUMN_KEY, AMOUNT_COLUMN_KEY)

const lineRow = (rowKey: string, label: string, amount: number) =>
  cashflowRow(rowKey, label, amount)

const totalRow = (rowKey: string, label: string, amount: number) =>
  cashflowRow(rowKey, label, amount, { bold: true })

export const generateCashflow = (params: URLSearchParams): UnifiedReport => {
  const range = reportRangeFromParams(params)
  const flow = (key: string, magnitude: number) =>
    sumAmountCentsInRange(key, range.startDate, range.endDate, { magnitude })

  const netIncome = netIncomeInRange(range, params)
  const depreciation = flow('cashflow:depreciation', 2)
  const receivablesChange = -flow('cashflow:receivables', 3)
  const payablesChange = flow('cashflow:payables', 3)
  const operating = netIncome + depreciation + receivablesChange + payablesChange

  const capex = -flow('cashflow:capex', 5)
  const investing = capex

  const distributions = -flow('cashflow:distributions', 3)
  const borrowing = flow('cashflow:borrowing', 2)
  const financing = distributions + borrowing

  const netChange = operating + investing + financing
  // Opening cash reflects the period start only, so it accumulates the trailing year up to the day before the range.
  const cashAtStart = 2_500_000
    + sumAmountCentsInRange('cashflow:opening', subMonths(range.startDate, 12), subDays(range.startDate, 1), { magnitude: 4 })
  const cashAtEnd = cashAtStart + netChange

  const rows: UnifiedReportRow[] = [
    lineRow('net_income', 'Net Income', netIncome),
    lineRow('depreciation', 'Depreciation & Amortization', depreciation),
    lineRow('accounts_receivable', 'Change in Accounts Receivable', receivablesChange),
    lineRow('accounts_payable', 'Change in Accounts Payable', payablesChange),
    totalRow('total_operating_activities', 'Net Cash from Operating Activities', operating),
    lineRow('capital_expenditures', 'Purchases of Property & Equipment', capex),
    totalRow('total_investing_activities', 'Net Cash from Investing Activities', investing),
    lineRow('owner_distributions', 'Owner Distributions', distributions),
    lineRow('debt_proceeds', 'Proceeds from Borrowing', borrowing),
    totalRow('total_financing_activities', 'Net Cash from Financing Activities', financing),
    totalRow('net_change_in_cash', 'Net Change in Cash', netChange),
    lineRow('cash_at_start', 'Cash at Beginning of Period', cashAtStart),
    totalRow('cash_at_end', 'Cash at End of Period', cashAtEnd),
  ]

  return unifiedReport(
    [rowHeaderColumn(NAME_COLUMN_KEY, 'Cash Flow'), numericColumn(AMOUNT_COLUMN_KEY, 'Amount', Pinning.Right)],
    rows,
  )
}
