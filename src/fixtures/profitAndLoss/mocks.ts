import type {
  ProfitAndLoss,
  ProfitAndLossSummary,
} from '@schemas/reports/profitAndLoss'

import { hasCompletedBooks } from '@fixtures/bookkeeping/mocks'
import {
  COGS_SPLIT,
  INCOME_SPLIT,
  OPEX_SPLIT,
  PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID,
  PROFIT_AND_LOSS_FIXTURE_START_YEAR,
} from '@fixtures/profitAndLoss/constants'
import { schema } from '@fixtures/profitAndLoss/schema'
import {
  EMPTY_SUMMARY,
  makeLineItem,
  makeSectionLineItem,
  sumSummaries,
} from '@fixtures/profitAndLoss/utils'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { fromMonthIndex, toMonthIndex } from '@fixtures/utils/monthIndex'

const generate = createGenerator(schema)

export const makeProfitAndLossSummary = (year: number, month: number): ProfitAndLossSummary => {
  const now = new Date()
  const isBeforeFixtureStart = year < PROFIT_AND_LOSS_FIXTURE_START_YEAR
  const isAfterCurrentMonth = toMonthIndex(year, month) > toMonthIndex(now.getFullYear(), now.getMonth() + 1)

  if (isBeforeFixtureStart || isAfterCurrentMonth) {
    return { year, month, ...EMPTY_SUMMARY }
  }

  // Same seed per calendar month, so every window and endpoint agrees on that month's numbers.
  // Fast-check biases its first samples toward range edges; the last of a few runs is well spread.
  const summaries = generate({ numRuns: 5, seed: year * 12 + month })
  const summary = { ...summaries[summaries.length - 1], year, month }

  if (!hasCompletedBooks(year, month)) return summary

  return {
    ...summary,
    fullyCategorized: true,
    uncategorizedInflows: 0,
    uncategorizedOutflows: 0,
    uncategorizedTransactions: 0,
  }
}

const makeSummariesForMonthIndices = (start: number, end: number): ProfitAndLossSummary[] => {
  const summaries: ProfitAndLossSummary[] = []

  for (let cursor = start; cursor <= end; cursor++) {
    const { year, month } = fromMonthIndex(cursor)
    summaries.push(makeProfitAndLossSummary(year, month))
  }

  return summaries
}

export const makeProfitAndLossSummaries = (
  { startYear, startMonth, endYear, endMonth }: {
    startYear: number
    startMonth: number
    endYear: number
    endMonth: number
  },
): ProfitAndLossSummary[] =>
  makeSummariesForMonthIndices(
    toMonthIndex(startYear, startMonth),
    toMonthIndex(endYear, endMonth),
  )

export const makeProfitAndLossReport = (
  { startDate, endDate }: { startDate: Date, endDate: Date },
): ProfitAndLoss => {
  const totals = sumSummaries(makeSummariesForMonthIndices(
    toMonthIndex(startDate.getFullYear(), startDate.getMonth() + 1),
    toMonthIndex(endDate.getFullYear(), endDate.getMonth() + 1),
  ))

  return {
    businessId: PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID,
    startDate,
    endDate,
    fullyCategorized: totals.fullyCategorized,
    grossProfit: totals.grossProfit,
    grossProfitPercentDelta: undefined,
    profitBeforeTaxes: totals.profitBeforeTaxes,
    profitBeforeTaxesPercentDelta: undefined,
    netProfit: totals.netProfit,
    netProfitPercentDelta: undefined,
    income: makeSectionLineItem('REVENUE', 'Revenue', totals.income, INCOME_SPLIT),
    costOfGoodsSold: makeSectionLineItem('COGS', 'Cost of Goods Sold', totals.costOfGoodsSold, COGS_SPLIT),
    expenses: makeSectionLineItem('OPERATING_EXPENSES', 'Operating Expenses', totals.operatingExpenses, OPEX_SPLIT),
    taxes: makeLineItem('TAXES', 'Taxes', totals.taxes, totals.taxes > 0
      ? [makeLineItem('INCOME_TAX', 'Income Tax', totals.taxes)]
      : []),
    customLineItems: null,
    otherOutflows: null,
    uncategorizedInflows: totals.uncategorizedInflows > 0
      ? makeLineItem('UNCATEGORIZED_INFLOWS', 'Uncategorized Inflows', totals.uncategorizedInflows)
      : undefined,
    uncategorizedOutflows: totals.uncategorizedOutflows > 0
      ? makeLineItem('UNCATEGORIZED_OUTFLOWS', 'Uncategorized Outflows', totals.uncategorizedOutflows)
      : undefined,
    personalExpenses: null,
  }
}
