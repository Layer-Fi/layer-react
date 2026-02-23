import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DateSelection } from '@components/DateSelection/DateSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
}

export const CombinedDateSelection = ({ mode, showLabels = true }: CombinedDateSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} />
  }

  return <DateSelection showLabels={showLabels} />
}
