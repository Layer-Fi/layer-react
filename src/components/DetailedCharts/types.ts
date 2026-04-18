export type DetailData<T extends SeriesData> = {
  data: T[]
  total: number
}

export type SeriesData = {
  value: number
  displayName: string
  name: string
  type?: string
}

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
