import { DateSelection } from './DateSelection'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

export const CombinedDateSelection = ({ mode }: { mode: 'month' | 'full' }) => {
  if (mode === 'month') {
    return <GlobalDatePicker />
  }

  return <DateSelection />
}
