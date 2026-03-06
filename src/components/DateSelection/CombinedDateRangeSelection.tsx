import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalDateRangeSelection } from '@components/DateSelection/GlobalDateRangeSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateRangeSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
}

export const CombinedDateRangeSelection = ({ mode, showLabels = true }: CombinedDateRangeSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} />
  }

  return <GlobalDateRangeSelection showLabels={showLabels} />
}
