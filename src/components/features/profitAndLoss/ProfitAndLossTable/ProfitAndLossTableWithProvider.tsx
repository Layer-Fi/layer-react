import { ReportsTableProvider } from '@providers/reports/ReportsTableContext/ReportsTableContext'
import {
  ProfitAndLossTableComponent,
  type ProfitAndLossTableProps,
} from '@features/profitAndLoss/ProfitAndLossTable/ProfitAndLossTableComponent'

export const ProfitAndLossTableWithProvider = (
  props: ProfitAndLossTableProps,
) => {
  return (
    <ReportsTableProvider>
      <ProfitAndLossTableComponent {...props} />
    </ReportsTableProvider>
  )
}
