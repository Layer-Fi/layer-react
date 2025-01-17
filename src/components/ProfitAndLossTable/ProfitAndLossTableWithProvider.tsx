import { useContext } from 'react'
import { TableProvider } from '../../contexts/TableContext'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossCompareTable } from './ProfitAndLossCompareTable'
import {
  ProfitAndLossTableComponent,
  ProfitAndLossTableProps,
} from './ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfitAndLossTableProps,
) => {
  const { compareMode } = useContext(ProfitAndLoss.ComparisonContext)
  return (
    <TableProvider>
      {compareMode ? (
        <div className='Layer__compare__table__wrapper'>
          <ProfitAndLossCompareTable {...props} />
        </div>
      ) : (
        <ProfitAndLossTableComponent {...props} />
      )}
    </TableProvider>
  )
}
