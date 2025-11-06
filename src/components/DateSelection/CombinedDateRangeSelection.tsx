import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { DateRangeSelection } from './DateRangeSelection'

export const CombinedDateRangeSelection = ({ mode }: { mode: 'month' | 'full' }) => {
  if (mode === 'month') {
    return <GlobalMonthPicker />
  }

  return <DateRangeSelection />
}
