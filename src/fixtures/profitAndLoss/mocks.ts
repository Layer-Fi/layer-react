import type { LineItem } from '@schemas/common/lineItem'
import type {
  ProfitAndLoss,
  ProfitAndLossSummary,
} from '@schemas/reports/profitAndLoss'

import { schema } from '@fixtures/profitAndLoss/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

export const PROFIT_AND_LOSS_FIXTURE_START_YEAR = 2022
export const PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

const generate = createGenerator(schema)

const EMPTY_SUMMARY: Omit<ProfitAndLossSummary, 'year' | 'month'> = {
  income: 0,
  costOfGoodsSold: 0,
  grossProfit: 0,
  operatingExpenses: 0,
  profitBeforeTaxes: 0,
  taxes: 0,
  netProfit: 0,
  fullyCategorized: true,
  totalExpenses: 0,
  uncategorizedInflows: 0,
  uncategorizedOutflows: 0,
  uncategorizedTransactions: 0,
  categorizedTransactions: 0,
}

const toMonthIndex = (year: number, month: number) => year * 12 + (month - 1)

const fromMonthIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
})

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

  return {
    ...summaries[summaries.length - 1],
    year,
    month,
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

const makeLineItem = (
  name: string,
  displayName: string,
  value: number,
  lineItems: LineItem[] = [],
): LineItem => ({
  name,
  displayName,
  value,
  isContra: false,
  lineItems,
})

type CategorySplit = readonly [name: string, displayName: string, share: number]

const INCOME_SPLIT: readonly CategorySplit[] = [
  ['SERVICE_REVENUE', 'Services', 0.54],
  ['PRODUCT_SALES', 'Product Sales', 0.31],
  ['SHIPPING_INCOME', 'Shipping Income', 0.09],
  ['INTEREST_INCOME', 'Interest Income', 0.06],
]

const COGS_SPLIT: readonly CategorySplit[] = [
  ['MATERIALS', 'Materials & Supplies', 0.58],
  ['SUBCONTRACTORS', 'Subcontractors', 0.28],
  ['FREIGHT', 'Freight & Delivery', 0.14],
]

const OPEX_SPLIT: readonly CategorySplit[] = [
  ['PAYROLL', 'Payroll', 0.42],
  ['RENT', 'Rent & Lease', 0.17],
  ['MARKETING', 'Marketing', 0.12],
  ['SOFTWARE', 'Software & Subscriptions', 0.09],
  ['INSURANCE', 'Insurance', 0.07],
  ['UTILITIES', 'Utilities', 0.05],
  ['OFFICE_SUPPLIES', 'Office Supplies', 0.04],
  ['TRAVEL', 'Travel & Meals', 0.04],
]

const splitIntoLineItems = (total: number, split: readonly CategorySplit[]): LineItem[] => {
  const values = split.map(([, , share]) => Math.round(total * share))
  const allocated = values.reduce((sum, value) => sum + value, 0)
  if (values.length > 0) values[0] += total - allocated

  return split.map(([name, displayName], index) => makeLineItem(name, displayName, values[index]))
}

const makeSectionLineItem = (
  name: string,
  displayName: string,
  total: number,
  split: readonly CategorySplit[],
): LineItem => makeLineItem(name, displayName, total, splitIntoLineItems(total, split))

// Every summary aggregate is linear, so range totals are just field-wise sums.
const sumSummaries = (summaries: ProfitAndLossSummary[]) =>
  summaries.reduce(
    (acc, summary) => ({
      income: acc.income + summary.income,
      costOfGoodsSold: acc.costOfGoodsSold + summary.costOfGoodsSold,
      grossProfit: acc.grossProfit + summary.grossProfit,
      operatingExpenses: acc.operatingExpenses + summary.operatingExpenses,
      profitBeforeTaxes: acc.profitBeforeTaxes + summary.profitBeforeTaxes,
      taxes: acc.taxes + summary.taxes,
      netProfit: acc.netProfit + summary.netProfit,
      totalExpenses: acc.totalExpenses + summary.totalExpenses,
      uncategorizedInflows: acc.uncategorizedInflows + summary.uncategorizedInflows,
      uncategorizedOutflows: acc.uncategorizedOutflows + summary.uncategorizedOutflows,
      uncategorizedTransactions: acc.uncategorizedTransactions + summary.uncategorizedTransactions,
      categorizedTransactions: acc.categorizedTransactions + summary.categorizedTransactions,
      fullyCategorized: acc.fullyCategorized && summary.fullyCategorized,
    }),
    EMPTY_SUMMARY,
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
