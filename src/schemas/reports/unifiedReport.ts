import { Schema, pipe } from 'effect'
import { LineItemSchema } from '../common/lineItem'
import { ReportingBasisSchema } from '../common/reportingBasis'
import { TagFilterParamsSchema } from '../../features/tags/tagSchemas'

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
export type DateQueryParams = typeof DateQueryParamsSchema.Type

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
export type DateRangeQueryParams = typeof DateRangeQueryParamsSchema.Type

export const UnifiedReportDateQueryParamsSchema = Schema.Union(
  DateQueryParamsSchema,
  DateRangeQueryParamsSchema,
)
export type UnifiedReportDateQueryParams = typeof UnifiedReportDateQueryParamsSchema.Type

export const UnifiedReportFilterParamsSchema = Schema.Struct({
  reportingBasis: pipe(
    Schema.propertySignature(Schema.NullOr(ReportingBasisSchema)),
    Schema.fromKey('reporting_basis'),
  ),
})
export type UnifiedReportFilterParams = typeof UnifiedReportFilterParamsSchema.Type

export const UnifiedReportQueryParamsSchema = Schema.extend(
  UnifiedReportDateQueryParamsSchema,
  Schema.extend(
    UnifiedReportFilterParamsSchema,
    TagFilterParamsSchema,
  ),
)
export type UnifiedReportQueryParams = typeof UnifiedReportQueryParamsSchema.Type

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
