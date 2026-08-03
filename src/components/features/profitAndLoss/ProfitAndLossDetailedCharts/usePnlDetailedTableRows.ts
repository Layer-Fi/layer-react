import type { PnlChartLineItem } from '@utils/profitAndLossUtils'
import { type DetailData } from '@components/DetailedCharts/types'
import type { DetailedTableRow } from '@components/DetailedTable/useDetailedTableRows'
import { useDetailedTableRows } from '@components/DetailedTable/useDetailedTableRows'

import { UNCATEGORIZED_TYPES } from './utils'

type UsePnlDetailedTableRowsParams = {
  data: DetailData<PnlChartLineItem>
}

export const usePnlDetailedTableRows = ({
  data,
}: UsePnlDetailedTableRowsParams): DetailedTableRow<PnlChartLineItem>[] => {
  return useDetailedTableRows({
    data,
    isDisabled: item => UNCATEGORIZED_TYPES.includes(item.name),
  })
}
