import { useMemo } from 'react'

import { type DetailData } from '@components/DetailedCharts/types'

import { type SeriesDataWithType } from './DetailedTable'

export type DetailedTableRow<T extends SeriesDataWithType> = {
  key: string
  item: T
  formattedShare: string
  isValueDisabled: boolean
}

type UseDetailedTableRowsParams<T extends SeriesDataWithType> = {
  data: DetailData<T>
  formatPercent: (value: number, options?: Intl.NumberFormatOptions) => string
  isValueDisabled?: (item: T) => boolean
}

export const useDetailedTableRows = <T extends SeriesDataWithType>({
  data,
  formatPercent,
  isValueDisabled,
}: UseDetailedTableRowsParams<T>): DetailedTableRow<T>[] => {
  return useMemo(() => {
    const positiveTotal = data.data
      .filter(x => x.value > 0)
      .reduce((sum, x) => sum + x.value, 0)

    const rowKeyOccurrences = new Map<string, number>()

    return data.data.map((item) => {
      const share = item.value > 0 ? item.value / positiveTotal : 0
      const shareFractionDigits = Math.abs(share) < 0.1 && share !== 0 ? 1 : 0
      const formattedShare = formatPercent(share, {
        maximumFractionDigits: shareFractionDigits,
      })

      const baseKey = `DetailedTableRow-${item.type}-${item.name}-${item.displayName}-${item.value}`
      const occurrence = rowKeyOccurrences.get(baseKey) ?? 0
      rowKeyOccurrences.set(baseKey, occurrence + 1)

      return {
        key: `${baseKey}-${occurrence}`,
        item,
        formattedShare,
        isValueDisabled: isValueDisabled?.(item) ?? false,
      }
    })
  }, [data, formatPercent, isValueDisabled])
}
