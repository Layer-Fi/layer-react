import React, { useContext } from 'react'
import { TableProvider } from '../../contexts/TableContext'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'
import { ProfitAndLossCompareTable } from './ProfitAndLossCompareTable'
import {
  ProfitAndLossTableComponent,
  ProfilAndLostTableProps,
} from './ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfilAndLostTableProps,
) => {
  const { compareMode } = useContext(ProfitAndLoss.Context)
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
