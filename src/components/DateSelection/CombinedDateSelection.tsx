import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DateSelection } from '@components/DateSelection/DateSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateSelectionProps = {
  mode: DateSelectionMode
}

export const CombinedDateSelection = ({ mode }: CombinedDateSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel />
  }

  return <DateSelection />
}
