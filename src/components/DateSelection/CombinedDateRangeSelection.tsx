import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

export type CombinedDateRangeSelectionProps = {
  mode: DateSelectionMode
  showLabels?: boolean
  truncateMonth?: boolean
}

export const CombinedDateRangeSelection = ({
  mode,
  showLabels = true,
  truncateMonth = false,
}: CombinedDateRangeSelectionProps) => {
  if (mode === 'month') {
    return <GlobalMonthPicker showLabel={showLabels} truncateMonth={truncateMonth} />
  }

  return <DateRangeSelection showLabels={showLabels} />
}
