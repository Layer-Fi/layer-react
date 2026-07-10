import type { LineItem } from '@schemas/common/lineItem'
import type { ProfitAndLossSummary } from '@schemas/reports/profitAndLoss'

import { type CategorySplit } from '@fixtures/profitAndLoss/constants'

export const EMPTY_SUMMARY: Omit<ProfitAndLossSummary, 'year' | 'month'> = {
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

export const makeLineItem = (
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

const splitIntoLineItems = (total: number, split: readonly CategorySplit[]): LineItem[] => {
  const values = split.map(([, , share]) => Math.round(total * share))
  const allocated = values.reduce((sum, value) => sum + value, 0)
  if (values.length > 0) values[0] += total - allocated

  return split.map(([name, displayName], index) => makeLineItem(name, displayName, values[index]))
}

export const makeSectionLineItem = (
  name: string,
  displayName: string,
  total: number,
  split: readonly CategorySplit[],
): LineItem => makeLineItem(name, displayName, total, splitIntoLineItems(total, split))

export const sumSummaries = (summaries: ProfitAndLossSummary[]) =>
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
