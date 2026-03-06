import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalDateSelection } from '@components/DateSelection/GlobalDateSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
}

export const CombinedDateSelection = ({ mode, showLabels = true }: CombinedDateSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} />
  }

  return <GlobalDateSelection showLabels={showLabels} />
}
