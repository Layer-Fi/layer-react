import { useLedgerDateRange, useLedgerDateRangeActions } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'

type LedgerDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const LedgerDateRangeSelection = ({ showLabels = false, isCompact = false }: LedgerDateRangeSelectionProps) => {
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useLedgerDateRangeActions()

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
