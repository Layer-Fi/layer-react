import { useContext } from 'react'
import { TableProvider } from '../../contexts/TableContext'
import { ProfitAndLossCompareTable } from './ProfitAndLossCompareTable'
import {
  ProfitAndLossTableComponent,
  ProfitAndLossTableProps,
} from './ProfitAndLossTableComponent'
import { ProfitAndLossComparisonContext } from '../../contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'

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
