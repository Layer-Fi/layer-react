import type { LineItem } from '@schemas/common/lineItem'
import type {
  ProfitAndLoss,
  ProfitAndLossSummary,
} from '@schemas/reports/profitAndLoss'

import { schema } from '@fixtures/profitAndLoss/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

export const PROFIT_AND_LOSS_FIXTURE_START_YEAR = 2022
export const PROFIT_AND_LOSS_FIXTURE_END_YEAR = 2025

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

/** Same seed per calendar month, so every window and endpoint agrees on that month's numbers. */
const seedForMonth = (year: number, month: number) => year * 12 + month

export const makeProfitAndLossSummary = (year: number, month: number): ProfitAndLossSummary => {
  if (year < PROFIT_AND_LOSS_FIXTURE_START_YEAR || year > PROFIT_AND_LOSS_FIXTURE_END_YEAR) {
    return { year, month, ...EMPTY_SUMMARY }
  }

  // Fast-check biases its first samples toward range edges; the last of a few runs is well spread.
  const summaries = generate({ numRuns: 5, seed: seedForMonth(year, month) })

  return {
    ...summaries[summaries.length - 1],
    year,
    month,
  }
}

export const makeProfitAndLossSummaries = (
  { startYear, startMonth, endYear, endMonth }: {
    startYear: number
    startMonth: number
    endYear: number
    endMonth: number
  },
): ProfitAndLossSummary[] => {
  const summaries: ProfitAndLossSummary[] = []

  for (let cursor = startYear * 12 + (startMonth - 1); cursor <= endYear * 12 + (endMonth - 1); cursor++) {
    summaries.push(makeProfitAndLossSummary(Math.floor(cursor / 12), (cursor % 12) + 1))
  }

  return summaries
}

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

/** Splits a total into per-category line items; rounding remainder lands on the first category. */
const splitIntoLineItems = (total: number, split: readonly CategorySplit[]): LineItem[] => {
  const items = split.map(([name, displayName, share]) => ({
    name,
    displayName,
    value: Math.round(total * share),
    isContra: false,
    lineItems: [],
  }))

  const allocated = items.reduce((sum, { value }) => sum + value, 0)
  if (items[0]) items[0].value += total - allocated

  return items
}

const makeSectionLineItem = (
  name: string,
  displayName: string,
  total: number,
  split: readonly CategorySplit[],
): LineItem => ({
  name,
  displayName,
  value: total,
  isContra: false,
  lineItems: splitIntoLineItems(total, split),
})

export const PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

const monthsInRange = (startDate: Date, endDate: Date) => {
  const months: Array<{ year: number, month: number }> = []

  const start = startDate.getFullYear() * 12 + startDate.getMonth()
  const end = endDate.getFullYear() * 12 + endDate.getMonth()

  for (let cursor = start; cursor <= end; cursor++) {
    months.push({ year: Math.floor(cursor / 12), month: (cursor % 12) + 1 })
  }

  return months
}

export const makeProfitAndLossReport = (
  { startDate, endDate }: { startDate: Date, endDate: Date },
): ProfitAndLoss => {
  const totals = monthsInRange(startDate, endDate)
    .map(({ year, month }) => makeProfitAndLossSummary(year, month))
    .reduce(
      (acc, summary) => ({
        income: acc.income + summary.income,
        cogs: acc.cogs + summary.costOfGoodsSold,
        opex: acc.opex + summary.operatingExpenses,
        taxes: acc.taxes + summary.taxes,
        uncatIn: acc.uncatIn + summary.uncategorizedInflows,
        uncatOut: acc.uncatOut + summary.uncategorizedOutflows,
        fullyCategorized: acc.fullyCategorized && summary.fullyCategorized,
      }),
      { income: 0, cogs: 0, opex: 0, taxes: 0, uncatIn: 0, uncatOut: 0, fullyCategorized: true },
    )

  const grossProfit = totals.income - totals.cogs
  const profitBeforeTaxes = grossProfit - totals.opex
  const netProfit = profitBeforeTaxes - totals.taxes

  return {
    businessId: PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID,
    startDate,
    endDate,
    fullyCategorized: totals.fullyCategorized,
    grossProfit,
    grossProfitPercentDelta: undefined,
    profitBeforeTaxes,
    profitBeforeTaxesPercentDelta: undefined,
    netProfit,
    netProfitPercentDelta: undefined,
    income: makeSectionLineItem('REVENUE', 'Revenue', totals.income, INCOME_SPLIT),
    costOfGoodsSold: makeSectionLineItem('COGS', 'Cost of Goods Sold', totals.cogs, COGS_SPLIT),
    expenses: makeSectionLineItem('OPERATING_EXPENSES', 'Operating Expenses', totals.opex, OPEX_SPLIT),
    taxes: {
      name: 'TAXES',
      displayName: 'Taxes',
      value: totals.taxes,
      isContra: false,
      lineItems: totals.taxes > 0
        ? [{
          name: 'INCOME_TAX',
          displayName: 'Income Tax',
          value: totals.taxes,
          isContra: false,
          lineItems: [],
        }]
        : [],
    },
    customLineItems: null,
    otherOutflows: null,
    uncategorizedInflows: totals.uncatIn > 0
      ? {
        name: 'UNCATEGORIZED_INFLOWS',
        displayName: 'Uncategorized Inflows',
        value: totals.uncatIn,
        isContra: false,
        lineItems: [],
      }
      : undefined,
    uncategorizedOutflows: totals.uncatOut > 0
      ? {
        name: 'UNCATEGORIZED_OUTFLOWS',
        displayName: 'Uncategorized Outflows',
        value: totals.uncatOut,
        isContra: false,
        lineItems: [],
      }
      : undefined,
    personalExpenses: null,
  }
}
