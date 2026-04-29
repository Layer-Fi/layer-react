import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalDateRangeSelection } from '@components/DateSelection/GlobalDateRangeSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateRangeSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
  isCompact?: boolean
}

export const CombinedDateRangeSelection = ({ mode, showLabels = true, isCompact = false }: CombinedDateRangeSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} />
  }

  return <GlobalDateRangeSelection showLabels={showLabels} isCompact={isCompact} />
}
