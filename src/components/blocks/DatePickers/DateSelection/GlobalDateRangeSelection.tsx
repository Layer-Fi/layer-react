import { useGlobalDatePreset, useGlobalDatePresetActions, useGlobalDateRange, useGlobalDateRangeActions } from '@providers/global/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangeSelection } from '@blocks/DatePickers/DateSelection/DateRangeSelection'

export type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateRangeSelection = ({ showLabels = false, isCompact = false }: GlobalDateRangeSelectionProps) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const datePreset = useGlobalDatePreset()
  const { setDateRange } = useGlobalDateRangeActions()
  const { setDatePreset } = useGlobalDatePresetActions()

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
