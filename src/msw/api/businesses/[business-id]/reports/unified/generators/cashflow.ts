import { subDays, subMonths } from 'date-fns'
import { sumBy } from 'lodash-es'

import { type UnifiedReport } from '@schemas/reports/unifiedReport'

import { netIncomeInRange } from '@msw/api/businesses/[business-id]/reports/unified/generators/balances'
import {
  lineItemTreeReport,
  type ReportLineItem,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/lineItemTree'
import {
  periodAmounts,
  periodColumns,
  reportRangeFromParams,
  resolvePeriods,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { type ReportDateRange } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { sumAmountCentsInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const OPENING_CASH_CENTS = 2_500_000

const flowFor = (key: string, magnitude: number, sign: 1 | -1 = 1) => (range: ReportDateRange) =>
  sign * sumAmountCentsInRange(key, range.startDate, range.endDate, { magnitude })

type CashflowChild = {
  name: string
  displayName: string
  amountFor: ((range: ReportDateRange) => number) | null
}

const ACTIVITY_SECTIONS: ReadonlyArray<{ name: string, displayName: string, children: CashflowChild[] }> = [
  {
    name: 'OPERATING_ACTIVITIES',
    displayName: 'Operating Activities',
    children: [
      { name: 'NET_INCOME', displayName: 'Net Income', amountFor: null },
      { name: 'DEPRECIATION', displayName: 'Depreciation & Amortization', amountFor: flowFor('cashflow:depreciation', 2) },
      { name: 'ACCOUNTS_RECEIVABLE', displayName: 'Change in Accounts Receivable', amountFor: flowFor('cashflow:receivables', 3, -1) },
      { name: 'ACCOUNTS_PAYABLE', displayName: 'Change in Accounts Payable', amountFor: flowFor('cashflow:payables', 3) },
    ],
  },
  {
    name: 'INVESTING_ACTIVITIES',
    displayName: 'Investing Activities',
    children: [
      { name: 'CAPITAL_EXPENDITURES', displayName: 'Purchases of Property & Equipment', amountFor: flowFor('cashflow:capex', 5, -1) },
    ],
  },
  {
    name: 'FINANCING_ACTIVITIES',
    displayName: 'Financing Activities',
    children: [
      { name: 'OWNER_DISTRIBUTIONS', displayName: 'Owner Distributions', amountFor: flowFor('cashflow:distributions', 3, -1) },
      { name: 'DEBT_PROCEEDS', displayName: 'Proceeds from Borrowing', amountFor: flowFor('cashflow:borrowing', 2) },
    ],
  },
]

export const generateCashflow = (params: URLSearchParams): UnifiedReport => {
  const periods = resolvePeriods(reportRangeFromParams(params), params.get('group_by'))

  const amountFor = (child: CashflowChild) => (range: ReportDateRange) =>
    child.amountFor?.(range) ?? netIncomeInRange(range, params)

  const sections: ReportLineItem[] = ACTIVITY_SECTIONS.map(section => ({
    name: section.name,
    displayName: section.displayName,
    amounts: periodAmounts(periods, r => sumBy(section.children, child => amountFor(child)(r))),
    childItems: section.children.map(child => ({
      name: child.name,
      displayName: child.displayName,
      amounts: periodAmounts(periods, amountFor(child)),
    })),
  }))

  const netChange = (range: ReportDateRange) =>
    sumBy(ACTIVITY_SECTIONS, section => sumBy(section.children, child => amountFor(child)(range)))

  // Opening cash is a point-in-time balance, so it accumulates the year before the period starts.
  const cashAtStart = (range: ReportDateRange) => OPENING_CASH_CENTS + sumAmountCentsInRange(
    'cashflow:opening',
    subMonths(range.startDate, 12),
    subDays(range.startDate, 1),
    { magnitude: 4 },
  )

  return lineItemTreeReport(periodColumns(periods), [
    ...sections,
    {
      name: 'Net Cash Increase For Period',
      displayName: 'Net Cash Increase For Period',
      amounts: periodAmounts(periods, netChange),
    },
    {
      name: 'Cash at Beginning of Period',
      displayName: 'Cash at Beginning of Period',
      amounts: periodAmounts(periods, cashAtStart),
    },
    {
      name: 'Cash at End of Period',
      displayName: 'Cash at End of Period',
      amounts: periodAmounts(periods, r => cashAtStart(r) + netChange(r)),
    },
  ])
}
