import type { PnlChartLineItem } from '@utils/features/profitAndLoss/profitAndLoss'
import { type DetailData } from '@ui/Chart/seriesTypes'
import type { DetailedTableRow } from '@blocks/DetailedTable/useDetailedTableRows'
import { useDetailedTableRows } from '@blocks/DetailedTable/useDetailedTableRows'

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
