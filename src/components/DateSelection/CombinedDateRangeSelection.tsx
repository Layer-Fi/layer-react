import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import { DateRangeSelection } from './DateRangeSelection'

export const CombinedDateRangeSelection = ({ mode }: { mode: DateSelectionMode }) => {
  if (mode === 'month') {
    return <GlobalMonthPicker />
  }

  return <DateRangeSelection />
}
