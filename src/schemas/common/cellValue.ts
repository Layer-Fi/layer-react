import { Schema } from 'effect'

// Presentation-agnostic cell value primitives, shared by the report domains that
// encode values with them. The full UnifiedCellValue union stays in
// @schemas/features/unifiedReports/unifiedReport, which composes these with its own members.

export const UnifiedCellValueCurrencySchema = Schema.Struct({
  type: Schema.Literal('Currency'),
  value: Schema.Number,
})

export const UnifiedCellValueDecimalSchema = Schema.Struct({
  type: Schema.Literal('Decimal'),
  value: Schema.Number,
})

export const UnifiedCellValuePercentageSchema = Schema.Struct({
  type: Schema.Literal('Percentage'),
  value: Schema.Number,
})

export const UnifiedCellValueUnknownSchema = Schema.Struct({
  type: Schema.String,
  value: Schema.optional(Schema.Unknown),
})
