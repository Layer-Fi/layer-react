import { ReportsTableProvider } from '@providers/features/reports/ReportsTableContext/ReportsTableContext'
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
