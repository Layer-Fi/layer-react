import { Arbitrary, Schema } from 'effect'

import { ProfitAndLossSummarySchema } from '@schemas/reports/profitAndLoss'

import {
  categorizedTransactionsArbitrary,
  costOfGoodsSoldArbitrary,
  incomeArbitrary,
  netProfitArbitrary,
  taxesArbitrary,
  uncategorizedAmountArbitrary,
  uncategorizedTransactionsArbitrary,
} from '@fixtures/profitAndLoss/arbitrary'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = ProfitAndLossSummarySchema.fields

const constantZero = <F>(field: F) => withArbitrary(field, () => fc => fc.constant(0))

const base = Schema.Struct({
  ...fields,
  year: constantZero(fields.year),
  month: constantZero(fields.month),
  income: withArbitrary(fields.income, () => incomeArbitrary),
  costOfGoodsSold: withArbitrary(fields.costOfGoodsSold, () => costOfGoodsSoldArbitrary),
  netProfit: withArbitrary(fields.netProfit, () => netProfitArbitrary),
  taxes: withArbitrary(fields.taxes, () => taxesArbitrary),
  uncategorizedInflows: withArbitrary(fields.uncategorizedInflows, () => uncategorizedAmountArbitrary),
  uncategorizedOutflows: withArbitrary(fields.uncategorizedOutflows, () => uncategorizedAmountArbitrary),
  categorizedTransactions: withArbitrary(fields.categorizedTransactions, () => categorizedTransactionsArbitrary),
  uncategorizedTransactions: withArbitrary(fields.uncategorizedTransactions, () => uncategorizedTransactionsArbitrary),
  grossProfit: constantZero(fields.grossProfit),
  operatingExpenses: constantZero(fields.operatingExpenses),
  profitBeforeTaxes: constantZero(fields.profitBeforeTaxes),
  totalExpenses: constantZero(fields.totalExpenses),
  fullyCategorized: withArbitrary(fields.fullyCategorized, () => fc => fc.constant(true)),
})

const baseArbitrary = Arbitrary.make(base)

/**
 * Re-derives the aggregate fields so every generated month satisfies the P&L
 * identities: grossProfit = income - COGS, profitBeforeTaxes = grossProfit -
 * operatingExpenses, netProfit = profitBeforeTaxes - taxes, and totalExpenses
 * = income - netProfit. Operating expenses absorb the remainder, which keeps
 * the generated (small, positive) net profit exact.
 */
export const ProfitAndLossSummaryArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((summary): typeof base.Type => {
      const { income, netProfit, taxes } = summary
      const costOfGoodsSold = Math.min(summary.costOfGoodsSold, Math.round(income * 0.45))
      const grossProfit = income - costOfGoodsSold
      const profitBeforeTaxes = netProfit + taxes
      const operatingExpenses = grossProfit - profitBeforeTaxes
      const fullyCategorized = summary.uncategorizedInflows === 0 && summary.uncategorizedOutflows === 0

      return {
        ...summary,
        costOfGoodsSold,
        grossProfit,
        operatingExpenses,
        profitBeforeTaxes,
        totalExpenses: costOfGoodsSold + operatingExpenses + taxes,
        fullyCategorized,
        uncategorizedTransactions: fullyCategorized ? 0 : summary.uncategorizedTransactions,
      }
    }),
})

export const schema = ProfitAndLossSummaryArbitrarySchema
