import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'

type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateRangeSelection = ({ showLabels = false, isCompact = false }: GlobalDateRangeSelectionProps) => {
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  return (
    <DateRangeSelection
      startDate={startDate}
      endDate={endDate}
      setDateRange={setDateRange}
      showLabels={showLabels}
      isCompact={isCompact}
    />
  )
}
