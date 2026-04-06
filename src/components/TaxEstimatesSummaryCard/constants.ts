import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'

export const DONUT_RADIUS = 52
export const DONUT_STROKE_WIDTH = 12
export const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
export const DONUT_SEGMENT_GAP = 4

export const getCategoryClassName = (key: TaxOverviewCategory['key']) => `Layer__TaxEstimatesSummaryCard__LegendSwatch--${key}`

export const getCategoryStroke = (key: TaxOverviewCategory['key']) => {
  switch (key) {
    case 'federal': return '#6D3CC8'
    case 'state': return '#D8B8F4'
  }
}
