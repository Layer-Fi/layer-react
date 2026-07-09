import { useGlobalDatePreset, useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'

type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
  includeAllTime?: boolean
}

export const GlobalDateRangeSelection = ({ showLabels = false, isCompact = false, includeAllTime = true }: GlobalDateRangeSelectionProps) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const preset = useGlobalDatePreset()
  const { setDateRange, setPresetRange } = useGlobalDateRangeActions()

  return (
    <DateRangeSelection
      dateRange={dateRange}
      setDateRange={setDateRange}
      preset={preset}
      setPresetRange={setPresetRange}
      includeAllTime={includeAllTime}
      showLabels={showLabels}
      isCompact={isCompact}
    />
  )
}
