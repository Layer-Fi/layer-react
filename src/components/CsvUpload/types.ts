export type PreviewCell<T> = {
  readonly raw: string
  readonly parsed: T
  readonly isValid: boolean
}

export type PreviewRow<T extends { [K in keyof T]: string | number | null | undefined }> = {
  readonly [K in keyof T]: PreviewCell<T[K]>
} & {
  readonly row: number
  readonly isValid: boolean
}

export type PreviewCsv<T extends { [K in keyof T]: string | number | null | undefined }> = ReadonlyArray<PreviewRow<T>>
