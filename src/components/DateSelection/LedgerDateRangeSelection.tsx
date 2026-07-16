import { useLedgerDatePreset, useLedgerDatePresetActions, useLedgerDateRange, useLedgerDateRangeActions } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'

type LedgerDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const LedgerDateRangeSelection = ({ showLabels = false, isCompact = false }: LedgerDateRangeSelectionProps) => {
  const dateRange = useLedgerDateRange({ dateSelectionMode: 'full' })
  const datePreset = useLedgerDatePreset()
  const { setDateRange } = useLedgerDateRangeActions()
  const { setDatePreset } = useLedgerDatePresetActions()

  return (
    <DateRangeSelection
      dateRange={dateRange}
      setDateRange={setDateRange}
      datePreset={datePreset}
      setDatePreset={setDatePreset}
      showLabels={showLabels}
      isCompact={isCompact}
    />
  )
}
