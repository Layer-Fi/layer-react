import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateRangeSelectionProps = {
  mode: DateSelectionMode
}

export const CombinedDateRangeSelection = ({ mode }: CombinedDateRangeSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel />
  }

  return <DateRangeSelection />
}
