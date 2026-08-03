import type { DateSelectionMode } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { GlobalDateSelection } from '@blocks/DatePickers/DateSelection/GlobalDateSelection'
import { GlobalMonthPicker } from '@blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
  isCompact?: boolean
}

export const CombinedDateSelection = ({ mode, showLabels = true, isCompact = false }: CombinedDateSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} />
  }

  return <GlobalDateSelection showLabels={showLabels} isCompact={isCompact} />
}
