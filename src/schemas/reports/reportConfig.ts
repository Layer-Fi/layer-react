import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

export enum ReportControl {
  DATE_RANGE = 'date_range',
  GROUP_BY = 'group_by',
  UNKNOWN = 'unknown',
}

export enum ReportType {
  PROFIT_AND_LOSS = 'profit-and-loss',
  CASHFLOW_STATEMENT = 'cashflow-statement',
  UNKNOWN = 'unknown',
}

export enum ReportGroupType {
  ACCOUNTING = 'accounting',
  UNKNOWN = 'unknown',
}

const ReportControlSchema = Schema.Enums(ReportControl)
const ReportTypeSchema = Schema.Enums(ReportType)
const ReportGroupTypeSchema = Schema.Enums(ReportGroupType)

const TransformedReportControlSchema = createTransformedEnumSchema(
  ReportControlSchema,
  ReportControl,
  ReportControl.UNKNOWN,
)

const TransformedReportTypeSchema = createTransformedEnumSchema(
  ReportTypeSchema,
  ReportType,
  ReportType.UNKNOWN,
)

const TransformedReportGroupTypeSchema = createTransformedEnumSchema(
  ReportGroupTypeSchema,
  ReportGroupType,
  ReportGroupType.UNKNOWN,
)

export const ReportConfigSchema = Schema.Struct({
  key: Schema.String,
  reportType: pipe(
    Schema.propertySignature(TransformedReportTypeSchema),
    Schema.fromKey('report_type'),
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
