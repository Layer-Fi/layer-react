export type DetailData<T extends SeriesData> = {
  data: T[]
  total: number
}

export type SeriesData = {
  value: number
  displayName: string
  name: string
}

export const DEFAULT_CHART_COLOR_TYPE = [
  '#008028',
  '#7417B3',
  '#006A80',
  '#8FB300',
  '#3D87CC',
  '#CC3DCC',
  '#3DCCB2',
  '#CCB129',
  '#2949CC',
  '#619900',
  '#6A52CC',
  '#71CC56',
]

export interface TypeColorMapping {
  color: string
  opacity: number
}

export const DEFAULT_TYPE_COLOR_MAPPING: TypeColorMapping = {
  color: '#EEEEF0',
  opacity: 1,
}

export type ColorSelector<T extends SeriesData> = (item: T) => TypeColorMapping
export type FallbackFillSelector<T extends SeriesData> = (item: T) => boolean
export type ValueFormatter = (value: number) => string
