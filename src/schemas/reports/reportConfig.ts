import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

export enum ReportControl {
  Date = 'date',
  DateRange = 'date_range',
  GroupBy = 'group_by',
  Unknown = 'unknown',
}

export enum ReportGroupType {
  Accounting = 'accounting',
  Unknown = 'unknown',
}

const ReportControlSchema = Schema.Enums(ReportControl)
const ReportGroupTypeSchema = Schema.Enums(ReportGroupType)

const TransformedReportControlSchema = createTransformedEnumSchema(
  ReportControlSchema,
  ReportControl,
  ReportControl.Unknown,
)

const TransformedReportGroupTypeSchema = createTransformedEnumSchema(
  ReportGroupTypeSchema,
  ReportGroupType,
  ReportGroupType.Unknown,
)

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
})
export type ReportConfig = typeof ReportConfigSchema.Type

export const ReportGroupSchema = Schema.Struct({
  groupType: pipe(
    Schema.propertySignature(TransformedReportGroupTypeSchema),
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
