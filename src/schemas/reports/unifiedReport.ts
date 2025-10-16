import { Schema, pipe } from 'effect'
import { LineItemSchema } from '../common/lineItem'

export enum ReportEnum {
  BalanceSheet = 'balance-sheet',
  CashflowStatement = 'cashflow-statement',
}

export const DateQueryParamsSchema = Schema.Struct({
  effectiveDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('effective_date'),
  ),
})

export const DateRangeQueryParamsSchema = Schema.Struct({
  startDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('start_date'),
  ),
  endDate: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('end_date'),
  ),
})

export const UnifiedReportDateQueryParamsSchema = Schema.Union(
  DateQueryParamsSchema,
  DateRangeQueryParamsSchema,
)
export type UnifiedReportDateQueryParams = typeof UnifiedReportDateQueryParamsSchema.Type

export const UnifiedReportSchema = Schema.Struct({
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(LineItemSchema)),
    Schema.fromKey('line_items'),
  ),
})

export type UnifiedReport = typeof UnifiedReportSchema.Type
