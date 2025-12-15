import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import { DateSelection } from './DateSelection'

export const CombinedDateSelection = ({ mode }: { mode: DateSelectionMode }) => {
  if (mode === 'month') {
    return <GlobalMonthPicker />
  }

  return <DateSelection />
}
