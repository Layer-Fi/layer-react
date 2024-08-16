import React from 'react'
import { TableProvider } from '../../contexts/TableContext'
import {
  ProfitAndLossTableComponent,
  ProfilAndLostTableProps,
} from './ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfilAndLostTableProps,
) => {
  return (
    <TableProvider>
      <ProfitAndLossTableComponent {...props} />
    </TableProvider>
  )
}
