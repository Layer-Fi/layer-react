import { TableProvider } from '@contexts/TableContext/TableContext'
import {
  ProfitAndLossTableComponent,
  type ProfitAndLossTableProps,
} from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfitAndLossTableProps,
) => {
  return (
    <TableProvider>
      <ProfitAndLossTableComponent {...props} />
    </TableProvider>
  )
}
