import { pipe, Schema } from 'effect'

import { ReportingBasis } from '@schemas/accountingConfiguration'
import { TagDimensionSchema, TagValueDefinitionSchema } from '@schemas/tag'
import { createTransformedEnumSchema } from '@schemas/utils'

export enum ReportControl {
  Date = 'date',
  DateRange = 'date_range',
  GroupBy = 'group_by',
  ReportingBasis = 'reporting_basis',
  Year = 'year',
  Unknown = 'unknown',
}

const ReportControlSchema = Schema.Enums(ReportControl)
const TransformedReportControlSchema = createTransformedEnumSchema(
  ReportControlSchema,
  ReportControl,
  ReportControl.Unknown,
)

export const UNIFIED_REPORT_REPORTING_BASIS_OPTIONS = [ReportingBasis.Cash, ReportingBasis.Accrual] as const
export type UnifiedReportReportingBasis = typeof UNIFIED_REPORT_REPORTING_BASIS_OPTIONS[number]

export const isUnifiedReportReportingBasis = (value: string | undefined): value is UnifiedReportReportingBasis =>
  UNIFIED_REPORT_REPORTING_BASIS_OPTIONS.includes(value as UnifiedReportReportingBasis)

export const TagControlSchema = Schema.Struct({
  tagDimension: pipe(
    Schema.propertySignature(TagDimensionSchema),
    Schema.fromKey('tag_dimension'),
  ),
  initialSelectedTags: pipe(
    Schema.propertySignature(Schema.Array(TagValueDefinitionSchema)),
    Schema.fromKey('initial_selected_tags'),
  ),
})
export type TagControl = typeof TagControlSchema.Type

export const ReportConfigSchema = Schema.Struct({
  key: Schema.String,
  reportRoute: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('report_route'),
  ),
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  controls: Schema.Array(TransformedReportControlSchema),
  baseQueryParameters: pipe(
    Schema.propertySignature(Schema.Record({ key: Schema.String, value: Schema.String })),
    Schema.fromKey('base_query_parameters'),
  ),
  isDefaultReport: Schema.optional(Schema.Boolean).pipe(Schema.fromKey('is_default_report')),
  tagControl: Schema.optional(Schema.NullOr(TagControlSchema)).pipe(Schema.fromKey('tag_control')),
})
export type ReportConfig = typeof ReportConfigSchema.Type

export const ReportGroupSchema = Schema.Struct({
  groupType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('group_type'),
  ),
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  reports: Schema.Array(ReportConfigSchema),
})
export type ReportGroup = typeof ReportGroupSchema.Type

export const ReportConfigResponseSchema = Schema.Struct({
  data: Schema.Array(ReportGroupSchema),
})
export type ReportConfigResponse = typeof ReportConfigResponseSchema.Type
