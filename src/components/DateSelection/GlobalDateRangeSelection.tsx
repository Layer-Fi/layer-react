import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'

type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateRangeSelection = ({ showLabels = false, isCompact = false }: GlobalDateRangeSelectionProps) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  return (
    <DateRangeSelection
      dateRange={dateRange}
      setDateRange={setDateRange}
      showLabels={showLabels}
      isCompact={isCompact}
    />
  )
}
