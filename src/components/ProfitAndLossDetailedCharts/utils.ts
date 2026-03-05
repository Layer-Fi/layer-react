import type { PnlChartLineItem } from '@utils/profitAndLossUtils'

import { UNCATEGORIZED_TYPES } from './DetailedTable'

const DEFAULT_CHART_COLOR_TYPE = [
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
