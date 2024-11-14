import React, { useContext } from 'react'
import { TableProvider } from '../../contexts/TableContext'
import { ProfitAndLossCompareTable } from './ProfitAndLossCompareTable'
import {
  ProfitAndLossTableComponent,
  ProfitAndLossTableProps,
} from './ProfitAndLossTableComponent'
import { PNLComparisonContext } from '../ProfitAndLoss/ProfitAndLoss'

export const ProfitAndLossTableWithProvider = (
  props: ProfitAndLossTableProps,
) => {
  const { compareMode } = useContext(PNLComparisonContext)
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
