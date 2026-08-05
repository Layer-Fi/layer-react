import { pipe, Schema } from 'effect'

import { LineItemSchema } from '@schemas/common/lineItem'

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
    Schema.propertySignature(Schema.NullishOr(Schema.Array(LineItemSchema))),
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
