import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import type { PnlChartLineItem } from '@utils/features/profitAndLoss/profitAndLoss'
import { DEFAULT_CHART_COLORS } from '@utils/shared/styles/chartColors'
import { DEFAULT_TYPE_COLOR_MAPPING, type TypeColorMapping } from '@ui/Chart/seriesTypes'

export const UNCATEGORIZED_TYPES = ['UNCATEGORIZED_INFLOWS', 'UNCATEGORIZED_OUTFLOWS']

export const UNCATEGORIZED_CHART_COLOR = '#EEEEF0'

export type ProfitAndLossChartColors = {
  revenue?: string[]
  expenses?: string[]
  uncategorized?: string
}

export const resolveScopedChartColorList = (
  scope: Scope,
  chartColors?: ProfitAndLossChartColors,
  chartColorsList?: string[],
): string[] | undefined =>
  (scope === 'revenue' ? chartColors?.revenue : chartColors?.expenses) ?? chartColorsList

export const resolveUncategorizedColor = (chartColors?: ProfitAndLossChartColors): string =>
  chartColors?.uncategorized ?? UNCATEGORIZED_CHART_COLOR

export const isLineItemUncategorized = (item: PnlChartLineItem) => {
  return UNCATEGORIZED_TYPES.includes(item.name)
}

export const mapTypesToColors = <T extends PnlChartLineItem>(
  data: T[],
  colorList: string[] = DEFAULT_CHART_COLORS,
  uncategorizedColor: string = UNCATEGORIZED_CHART_COLOR,
): (name: string) => TypeColorMapping => {
  const opacityTiers = [1, 0.82, 0.64, 0.46]
  const palette = colorList.length > 0 ? colorList : DEFAULT_CHART_COLORS
  const mapping: Record<string, TypeColorMapping> = {}
  const categorizedNames = Array.from(
    new Set(
      data
        .filter(lineItem => !isLineItemUncategorized(lineItem))
        .map(lineItem => lineItem.name),
    ),
  ).sort((left, right) => left.localeCompare(right))

  categorizedNames.forEach((name, index) => {
    const colorIndex = index % palette.length
    const cycle = Math.floor(index / palette.length)
    const opacity = opacityTiers[cycle % opacityTiers.length] ?? 1
    mapping[name] = {
      color: palette[colorIndex] ?? DEFAULT_CHART_COLORS[0],
      opacity,
    }
  })

  data.forEach((lineItem) => {
    const key = lineItem.name
    if (mapping[key]) {
      return
    }

    if (isLineItemUncategorized(lineItem)) {
      mapping[key] = {
        color: uncategorizedColor,
        opacity: 1,
      }
      return
    }
  })

  return (name: string): TypeColorMapping => mapping[name] ?? DEFAULT_TYPE_COLOR_MAPPING
}
