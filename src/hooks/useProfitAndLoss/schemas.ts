import { Schema, pipe } from 'effect'
import { Direction } from '../../types'

import { LedgerEntrySourceSchema } from '../../schemas/generalLedger/ledgerEntrySource'
import { AccountSchema } from '../../schemas/generalLedger/ledgerAccount'

import { LineItemSchema } from '../../utils/schema/utils'

export const TagFilterSchema = Schema.Struct({
  key: Schema.String,
  values: Schema.Array(Schema.String),
})

export const PnlDetailLineSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: AccountSchema,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  date: Schema.String,
  source: Schema.optional(LedgerEntrySourceSchema),
})

export const PnlDetailLinesDataSchema = Schema.Struct({
  type: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  startDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('start_date'),
  ),
  endDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('end_date'),
  ),
  pnlStructureLineItemName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('pnl_structure_line_item_name'),
  ),
  reportingBasis: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reporting_basis'),
  ),
  pnlStructure: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('pnl_structure'),
  ),
  tagFilter: pipe(
    Schema.propertySignature(Schema.NullOr(TagFilterSchema)),
    Schema.fromKey('tag_filter'),
  ),
  lines: Schema.Array(PnlDetailLineSchema),
})

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

const profitAndLossBaseParams = {
  businessId: Schema.String,
  tagKey: Schema.optional(Schema.String),
  tagValues: Schema.optional(Schema.String),
  reportingBasis: Schema.optional(Schema.String),
}

export const ProfitAndLossSummariesRequestParamsSchema = Schema.Struct({
  ...profitAndLossBaseParams,
  startYear: Schema.Number,
  startMonth: Schema.Number,
  endYear: Schema.Number,
  endMonth: Schema.Number,
})

export type ProfitAndLossSummariesRequestParams =
  typeof ProfitAndLossSummariesRequestParamsSchema.Type

export const ProfitAndLossReportRequestParamsSchema = Schema.Struct({
  ...profitAndLossBaseParams,
  startDate: Schema.Date,
  endDate: Schema.Date,
  includeUncategorized: Schema.optional(Schema.Boolean),
})

export type ProfitAndLossReportRequestParams =
  typeof ProfitAndLossReportRequestParamsSchema.Type

export const ProfitAndLossReportSchema = Schema.Struct({
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),

  startDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('start_date'),
  ),

  endDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('end_date'),
  ),

  fullyCategorized: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('fully_categorized'),
  ),

  grossProfit: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('gross_profit'),
  ),

  grossProfitPercentDelta: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.BigDecimal)),
    Schema.fromKey('gross_profit_percent_delta'),
  ),

  profitBeforeTaxes: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('profit_before_taxes'),
  ),

  profitBeforeTaxesPercentDelta: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.BigDecimal)),
    Schema.fromKey('profit_before_taxes_percent_delta'),
  ),

  netProfit: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('net_profit'),
  ),

  netProfitPercentDelta: pipe(
    Schema.propertySignature(Schema.UndefinedOr(Schema.BigDecimal)),
    Schema.fromKey('net_profit_percent_delta'),
  ),

  income: LineItemSchema,

  costOfGoodsSold: pipe(
    Schema.propertySignature(LineItemSchema),
    Schema.fromKey('cost_of_goods_sold'),
  ),

  expenses: LineItemSchema,

  taxes: LineItemSchema,

  customLineItems: pipe(
    Schema.propertySignature(Schema.NullOr(LineItemSchema)),
    Schema.fromKey('custom_line_items'),
  ),

  otherOutflows: pipe(
    Schema.propertySignature(Schema.NullOr(LineItemSchema)),
    Schema.fromKey('other_outflows'),
  ),

  uncategorizedOutflows: Schema.optional(LineItemSchema).pipe(
    Schema.fromKey('uncategorized_outflows'),
  ),

  uncategorizedInflows: Schema.optional(LineItemSchema).pipe(
    Schema.fromKey('uncategorized_inflows'),
  ),

  personalExpenses: pipe(
    Schema.propertySignature(Schema.NullOr(LineItemSchema)),
    Schema.fromKey('personal_expenses'),
  ),
})
export type ProfitAndLoss = typeof ProfitAndLossReportSchema.Type
