import { useContext } from 'react'

import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { TableProvider } from '@contexts/TableContext/TableContext'
import { ProfitAndLossCompareTable } from '@components/ProfitAndLossTable/ProfitAndLossCompareTable'
import {
  ProfitAndLossTableComponent,
  type ProfitAndLossTableProps,
} from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfitAndLossTableProps,
) => {
  const { compareModeActive } = useContext(ProfitAndLossComparisonContext)

  return (
    <TableProvider>
      {compareModeActive
        ? (
          <div className='Layer__compare__table__wrapper'>
            <ProfitAndLossCompareTable {...props} />
          </div>
        )
        : (
          <ProfitAndLossTableComponent {...props} />
        )}
    </TableProvider>
  )
}
