import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'

export const DONUT_INNER_RADIUS = 52
export const DONUT_STROKE_WIDTH = 12
export const DONUT_OUTER_RADIUS = DONUT_INNER_RADIUS + DONUT_STROKE_WIDTH
export const DONUT_PADDING_ANGLE = 2

const CATEGORY_COLOR_MAP: Record<TaxOverviewCategory['key'], string> = {
  federal: '#6D3CC8',
  state: '#D8B8F4',
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export const resolveCategoryColor = ({ color, key }: Pick<TaxOverviewCategory, 'color' | 'key'>) => {
  if (color && HEX_COLOR_REGEX.test(color)) {
    return color
  }

  return CATEGORY_COLOR_MAP[key]
}
