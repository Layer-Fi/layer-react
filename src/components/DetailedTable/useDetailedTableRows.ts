import { useMemo } from 'react'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { type DetailData } from '@components/DetailedCharts/types'
import { type SeriesData } from '@components/DetailedCharts/types'

export type DetailedTableRow<T extends SeriesData> = {
  key: string
  item: T
  formattedShare: string
  isValueDisabled: boolean
}

type UseDetailedTableRowsParams<T extends SeriesData> = {
  data: DetailData<T>
  isDisabled?: (item: T) => boolean
}

export const useDetailedTableRows = <T extends SeriesData>({
  data,
  isDisabled,
}: UseDetailedTableRowsParams<T>): DetailedTableRow<T>[] => {
  const { formatPercent } = useIntlFormatter()

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

      const baseKey = `DetailedTableRow-${'type' in item ? item.type : ''}-${item.name}-${item.displayName}-${item.value}`
      const occurrence = rowKeyOccurrences.get(baseKey) ?? 0
      rowKeyOccurrences.set(baseKey, occurrence + 1)

      return {
        key: `${baseKey}-${occurrence}`,
        item,
        formattedShare,
        isValueDisabled: isDisabled?.(item) ?? false,
      }
    })
  }, [data, formatPercent, isDisabled])
}
