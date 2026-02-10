import { DEFAULT_CHART_COLOR_TYPE } from '@config/charts'
import type { PnlChartLineItem } from '@utils/profitAndLossUtils'

import { UNCATEGORIZED_TYPES } from './DetailedTable'

export interface TypeColorMapping {
  color: string
  opacity: number
}
export const isLineItemUncategorized = (item: PnlChartLineItem) => {
  return UNCATEGORIZED_TYPES.includes(item.name)
}

export const mapTypesToColors = (
  data: PnlChartLineItem[],
  colorList: string[] = DEFAULT_CHART_COLOR_TYPE,
): TypeColorMapping[] => {
  const nameToColor: Record<string, string> = {}
  const nameToLastOpacity: Record<string, number> = {}
  let colorIndex = 0

  return data.map((lineItem) => {
    if (isLineItemUncategorized(lineItem)) {
      return {
        color: '#EEEEF0',
        opacity: 1,
      }
    }

    const name = lineItem.name
    const existingColor = nameToColor[name]

    // First occurrence of this name — assign the next color at full opacity
    if (!existingColor) {
      const color = colorList[colorIndex % colorList.length] ?? '#000000'
      nameToColor[name] = color
      nameToLastOpacity[name] = 1
      colorIndex++
      return { color, opacity: 1 }
    }

    // Repeated occurrence — reuse the same color but fade opacity
    const opacity = (nameToLastOpacity[name] ?? 1) - 0.1
    nameToLastOpacity[name] = opacity
    return { color: existingColor, opacity }
  })
}
