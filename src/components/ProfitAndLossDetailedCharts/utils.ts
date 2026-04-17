import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { type TypeColorMapping } from '@components/DetailedCharts/types'

import { UNCATEGORIZED_TYPES } from './pnlDetailedTable.constants'

export const isLineItemUncategorized = (item: PnlChartLineItem) => {
  return UNCATEGORIZED_TYPES.includes(item.name)
}

export const mapTypesToColors = <T extends PnlChartLineItem>(
  data: T[],
  colorList: string[] = DEFAULT_CHART_COLORS,
): (name: string) => TypeColorMapping | undefined => {
  const opacityTiers = [1, 0.82, 0.64, 0.46]
  const palette = colorList.length > 0 ? colorList : DEFAULT_CHART_COLORS
  const mapping: Record<string, TypeColorMapping> = {}
  const nonUncategorizedNames = Array.from(
    new Set(
      data
        .filter(lineItem => !isLineItemUncategorized(lineItem))
        .map(lineItem => lineItem.name),
    ),
  ).sort((left, right) => left.localeCompare(right))

  nonUncategorizedNames.forEach((name, index) => {
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
        color: '#EEEEF0',
        opacity: 1,
      }
      return
    }
  })

  return (name: string): TypeColorMapping | undefined => mapping[name]
}
