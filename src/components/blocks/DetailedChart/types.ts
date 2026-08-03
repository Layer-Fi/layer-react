import { type SeriesData } from '@ui/Chart/seriesTypes'

export type FallbackFillSelector<T extends SeriesData> = (item: T) => boolean
