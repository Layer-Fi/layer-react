import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

export enum ReportControl {
  DateRange = 'date_range',
  GroupBy = 'group_by',
  Unknown = 'unknown',
}

export enum ReportType {
  ProfitAndLoss = 'profit-and-loss',
  BalanceSheet = 'balance-sheet',
  CashflowStatement = 'cashflow-statement',
  TrialBalance = 'trial-balance',
  Unknown = 'unknown',
}

export enum ReportGroupType {
  Accounting = 'accounting',
  Unknown = 'unknown',
}

const ReportControlSchema = Schema.Enums(ReportControl)
const ReportTypeSchema = Schema.Enums(ReportType)
const ReportGroupTypeSchema = Schema.Enums(ReportGroupType)

const TransformedReportControlSchema = createTransformedEnumSchema(
  ReportControlSchema,
  ReportControl,
  ReportControl.Unknown,
)

const TransformedReportTypeSchema = createTransformedEnumSchema(
  ReportTypeSchema,
  ReportType,
  ReportType.Unknown,
)

const TransformedReportGroupTypeSchema = createTransformedEnumSchema(
  ReportGroupTypeSchema,
  ReportGroupType,
  ReportGroupType.Unknown,
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
