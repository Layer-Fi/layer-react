import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateRangeSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
}

export const CombinedDateRangeSelection = ({ mode, showLabels = true }: CombinedDateRangeSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} />
  }

  return <DateRangeSelection showLabels={showLabels} />
}
