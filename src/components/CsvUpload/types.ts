export type PreviewCell<T> = {
  raw: string
  parsed: T
  is_valid: boolean
}

export type PreviewRow<T extends { [K in keyof T]: string | number }> = {
  [K in keyof T]: PreviewCell<T[K]>
} & {
  index: number
  is_valid: boolean
}

export type PreviewCsv<T extends { [K in keyof T]: string | number }> = PreviewRow<T>[]
