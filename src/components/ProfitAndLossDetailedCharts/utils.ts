import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { DEFAULT_CHART_COLOR_TYPE, type TypeColorMapping } from '@components/DetailedCharts/types'
import { UNCATEGORIZED_TYPES } from '@components/DetailedTable/DetailedTable'

export const isLineItemUncategorized = (item: PnlChartLineItem) => {
  return UNCATEGORIZED_TYPES.includes(item.name)
}

export const mapTypesToColors = <T extends PnlChartLineItem>(
  data: T[],
  colorList: string[] = DEFAULT_CHART_COLOR_TYPE,
): (name: string) => TypeColorMapping | undefined => {
  const stableHash = (value: string) => {
    let hash = 2166136261
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
  }

  const mapping: Record<string, TypeColorMapping> = {}

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

    const colorIndex = stableHash(key) % colorList.length
    mapping[key] = {
      color: colorList[colorIndex],
      opacity: 1,
    }
  })

  return (name: string): TypeColorMapping | undefined => mapping[name]
}
