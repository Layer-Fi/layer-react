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
    if (!nameToColor[name]) {
      nameToColor[name] = colorList[colorIndex % colorList.length]
      colorIndex++
      nameToLastOpacity[name] = 1
    }
    else {
      nameToLastOpacity[name] -= 0.1
    }

    const opacity = nameToLastOpacity[name]

    return {
      color: nameToColor[name],
      opacity: opacity,
    }
  })
}
