import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { DEFAULT_CHART_COLORS } from '@utils/chartColors'

export const DONUT_INNER_RADIUS = 52
export const DONUT_STROKE_WIDTH = 12
export const DONUT_OUTER_RADIUS = DONUT_INNER_RADIUS + DONUT_STROKE_WIDTH
export const DONUT_PADDING_ANGLE = 2

export const resolveCategoryColor = ({ key }: Pick<TaxOverviewCategory, 'key'>) => {
  return {
    federal: DEFAULT_CHART_COLORS[0],
    state: DEFAULT_CHART_COLORS[1],
  }[key]
}
