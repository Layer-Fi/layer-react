import type { DateSelectionMode } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalDateRangeSelection } from '@blocks/DatePickers/DateSelection/GlobalDateRangeSelection'
import { GlobalMonthPicker } from '@blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'

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
