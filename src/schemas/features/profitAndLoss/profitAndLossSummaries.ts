import { pipe, Schema } from 'effect'

export const ProfitAndLossSummarySchema = Schema.Struct({
  year: Schema.Number,
  month: Schema.Number,
  income: Schema.Number,
  costOfGoodsSold: Schema.Number,
  grossProfit: Schema.Number,
  operatingExpenses: Schema.Number,
  profitBeforeTaxes: Schema.Number,
  taxes: Schema.Number,
  netProfit: Schema.Number,
  fullyCategorized: Schema.Boolean,
  totalExpenses: Schema.Number,
  uncategorizedInflows: Schema.Number,
  uncategorizedOutflows: Schema.Number,

  uncategorizedTransactions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('uncategorized_transactions'),
  ),

  categorizedTransactions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('categorized_transactions'),
  ),
})

export type ProfitAndLossSummary = typeof ProfitAndLossSummarySchema.Type

export const ProfitAndLossSummariesSchema = Schema.Struct({
  type: Schema.Literal('Profit_And_Loss_Summaries'),
  months: Schema.Array(ProfitAndLossSummarySchema),
})

export type ProfitAndLossSummaries = typeof ProfitAndLossSummariesSchema.Type
