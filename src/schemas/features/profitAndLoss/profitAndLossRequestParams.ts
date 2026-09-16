import { Schema } from 'effect'

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
