import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/utils'

export enum DateGroupBy {
  AllTime = 'ALL_TIME',
  Month = 'MONTH',
  Year = 'YEAR',
}

export enum Alignment {
  Left = 'LEFT',
  Right = 'RIGHT',
  Center = 'CENTER',
}

const AlignmentSchema = Schema.Enums(Alignment)

const TransformedAlignmentSchema = createTransformedEnumSchema(
  AlignmentSchema,
  Alignment,
  Alignment.Left,
)

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
  isRowHeader: Schema.optional(Schema.Boolean).pipe(Schema.fromKey('is_row_header')),
  alignment: Schema.optional(TransformedAlignmentSchema),
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

const UnifiedCellValueAmountSchema = Schema.Struct({
  type: Schema.Literal('Amount'),
  value: Schema.Number,
})

const UnifiedCellValueEmptySchema = Schema.Struct({
  type: Schema.Literal('Empty'),
})

const UnifiedCellValueUnknownSchema = Schema.Struct({
  type: Schema.String,
  value: Schema.optional(Schema.Unknown),
})

const UnifiedCellValueSchema = Schema.Union(
  UnifiedCellValueAmountSchema,
  UnifiedCellValueEmptySchema,
  UnifiedCellValueUnknownSchema,
)

export type UnifiedCellValue = typeof UnifiedCellValueSchema.Type
export type UnifiedCellValueAmount = typeof UnifiedCellValueAmountSchema.Type
export type UnifiedCellValueEmpty = typeof UnifiedCellValueEmptySchema.Type
export type UnifiedCellValueUnknown = typeof UnifiedCellValueUnknownSchema.Type

export const isAmountCellValue = (value: UnifiedCellValue): value is UnifiedCellValueAmount =>
  value.type === 'Amount'

export const isEmptyCellValue = (value: UnifiedCellValue): value is UnifiedCellValueEmpty =>
  value.type === 'Empty'

const UnifiedReportCellSchema = Schema.Struct({
  value: UnifiedCellValueSchema,
})

const unifiedReportRowFields = {
  rowKey: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('row_key'),
  ),
  cells: Schema.Record({
    key: Schema.String,
    value: Schema.NullishOr(UnifiedReportCellSchema),
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
