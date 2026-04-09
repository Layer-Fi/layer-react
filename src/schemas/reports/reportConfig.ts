import { pipe, Schema } from 'effect'

export const ReportControlSchema = Schema.Literal('date_range', 'group_by', 'unknown')
export type ReportControl = typeof ReportControlSchema.Type

const TransformedReportControlSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(ReportControlSchema),
  {
    decode: (input) => {
      if (ReportControlSchema.literals.includes(input as ReportControl)) {
        return input as ReportControl
      }

      return 'unknown'
    },
    encode: input => input,
  },
)

export const ReportTypeSchema = Schema.Literal('profit-and-loss', 'cashflow-statement', 'unknown')
export type ReportType = typeof ReportTypeSchema.Type

const TransformedReportTypeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(ReportTypeSchema),
  {
    decode: (input) => {
      if (ReportTypeSchema.literals.includes(input as ReportType)) {
        return input as ReportType
      }

      return 'unknown'
    },
    encode: input => input,
  },
)

export const ReportGroupTypeSchema = Schema.Literal('accounting', 'unknown')
export type ReportGroupType = typeof ReportGroupTypeSchema.Type

const TransformedReportGroupTypeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(ReportGroupTypeSchema),
  {
    decode: (input) => {
      if (ReportGroupTypeSchema.literals.includes(input as ReportGroupType)) {
        return input as ReportGroupType
      }

      return 'unknown'
    },
    encode: input => input,
  },
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
