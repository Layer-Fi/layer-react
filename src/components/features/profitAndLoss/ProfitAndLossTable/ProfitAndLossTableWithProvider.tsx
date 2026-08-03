import { TableProvider } from '@contexts/TableContext/TableContext'
import {
  ProfitAndLossTableComponent,
  type ProfitAndLossTableProps,
} from '@features/profitAndLoss/ProfitAndLossTable/ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfitAndLossTableProps,
) => {
  return (
    <TableProvider>
      <ProfitAndLossTableComponent {...props} />
    </TableProvider>
  )
}
