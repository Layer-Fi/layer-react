import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalDateSelection } from '@components/DateSelection/GlobalDateSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

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
