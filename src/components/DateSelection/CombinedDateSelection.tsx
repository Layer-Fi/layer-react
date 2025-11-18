import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import { DateSelection } from './DateSelection'

export const CombinedDateSelection = ({ mode }: { mode: 'month' | 'full' }) => {
  if (mode === 'month') {
    return <GlobalDatePicker />
  }

  return <DateSelection />
}
