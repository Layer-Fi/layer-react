import { pipe, Schema } from 'effect'

export const PreviewCellSchema = <Value extends Schema.Schema.Any>(parsed: Value) =>
  Schema.Struct({
    raw: Schema.String,
    parsed: Schema.NullishOr(parsed),
    isValid: pipe(
      Schema.propertySignature(Schema.Boolean),
      Schema.fromKey('is_valid'),
    ),
  })

export type PreviewCell<T> = Schema.Schema.Type<
  ReturnType<typeof PreviewCellSchema<Schema.Schema<T>>>
>

export const PreviewRowSchema = <Cells extends Schema.Struct.Fields>(cells: Cells) =>
  Schema.Struct({
    ...cells,
    row: Schema.Number,
    isValid: pipe(
      Schema.propertySignature(Schema.Boolean),
      Schema.fromKey('is_valid'),
    ),
  })

export type PreviewRow<T extends { [K in keyof T]: string | number | null | undefined }> = {
  readonly [K in keyof T]?: PreviewCell<T[K]> | null
} & {
  readonly row: number
  readonly isValid: boolean
}

export type PreviewCsv<T extends { [K in keyof T]: string | number | null | undefined }> = ReadonlyArray<PreviewRow<T>>
