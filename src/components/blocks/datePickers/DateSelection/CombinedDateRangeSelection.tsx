import type { DateSelectionMode } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { GlobalDateRangeSelection } from '@blocks/datePickers/DateSelection/GlobalDateRangeSelection'
import { GlobalMonthPicker } from '@blocks/datePickers/GlobalMonthPicker/GlobalMonthPicker'

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
