import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { type DetailData } from '@components/DetailedCharts/types'
import type { DetailedTableRow } from '@components/DetailedTable/useDetailedTableRows'
import { useDetailedTableRows } from '@components/DetailedTable/useDetailedTableRows'

import { UNCATEGORIZED_TYPES } from './utils'

type UsePnlDetailedTableRowsParams = {
  data: DetailData<PnlChartLineItem>
  formatPercent: (value: number, options?: Intl.NumberFormatOptions) => string
}

export const usePnlDetailedTableRows = ({
  data,
  formatPercent,
}: UsePnlDetailedTableRowsParams): DetailedTableRow<PnlChartLineItem>[] => {
  return useDetailedTableRows({
    data,
    formatPercent,
    isValueDisabled: item => UNCATEGORIZED_TYPES.includes(item.name),
  })
}
