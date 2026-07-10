import { useGlobalDateRangeActions, useGlobalPresetRange, useGlobalPresetRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangeSelection } from '@components/DateSelection/DateRangeSelection'

type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
  includeAllTime?: boolean
}

export const GlobalDateRangeSelection = ({ showLabels = false, isCompact = false, includeAllTime = true }: GlobalDateRangeSelectionProps) => {
  const { startDate, endDate, preset } = useGlobalPresetRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()
  const { setPresetRange } = useGlobalPresetRangeActions()

  return (
    <DateRangeSelection
      dateRange={{ startDate, endDate }}
      setDateRange={setDateRange}
      preset={preset}
      setPresetRange={setPresetRange}
      includeAllTime={includeAllTime}
      showLabels={showLabels}
      isCompact={isCompact}
    />
  )
}
