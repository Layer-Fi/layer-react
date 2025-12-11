import { pipe, Schema } from 'effect'

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

const unifiedReportColumnFields = {
  columnKey: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('column_key'),
  ),
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
}

export interface UnifiedReportColumn extends Schema.Struct.Type<typeof unifiedReportColumnFields> {
  columns?: ReadonlyArray<UnifiedReportColumn>
}

export type UnifiedReportColumnWithRequired<K extends keyof UnifiedReportColumn> =
  UnifiedReportColumn & Required<Pick<UnifiedReportColumn, K>>

export interface UnifiedReportColumnEncoded extends Schema.Struct.Encoded<typeof unifiedReportColumnFields> {
  readonly columns?: ReadonlyArray<UnifiedReportColumnEncoded>
}

export const UnifiedReportColumnSchema = Schema.Struct({
  ...unifiedReportColumnFields,
  columns: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Schema<UnifiedReportColumn, UnifiedReportColumnEncoded> => UnifiedReportColumnSchema),
    ),
  ),
})

const UnifiedRowCellFormatSchema = Schema.Struct({
  value: Schema.Number,
})

const UnifiedRowCellSchema = Schema.Struct({
  value: UnifiedRowCellFormatSchema,
})

const unifiedReportRowFields = {
  rowKey: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('row_key'),
  ),
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
  cells: Schema.Record({
    key: Schema.String,
    value: UnifiedRowCellSchema,
  }),
}

export interface UnifiedReportRow extends Schema.Struct.Type<typeof unifiedReportRowFields> {
  rows?: ReadonlyArray<UnifiedReportRow>
}

export interface UnifiedReportRowEncoded extends Schema.Struct.Encoded<typeof unifiedReportRowFields> {
  readonly rows?: ReadonlyArray<UnifiedReportRowEncoded>
}

export const UnifiedReportRowSchema = Schema.Struct({
  ...unifiedReportRowFields,
  rows: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Schema<UnifiedReportRow, UnifiedReportRowEncoded> => UnifiedReportRowSchema),
    ),
  ),
})

export const UnifiedReportSchema = Schema.Struct({
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  columns: Schema.Array(UnifiedReportColumnSchema),
  rows: Schema.Array(UnifiedReportRowSchema),
})

export type UnifiedReport = typeof UnifiedReportSchema.Type
export type UnifiedReportEncoded = typeof UnifiedReportSchema.Encoded
