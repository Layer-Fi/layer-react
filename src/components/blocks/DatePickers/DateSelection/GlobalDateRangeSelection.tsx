import { useGlobalDatePreset, useGlobalDatePresetActions, useGlobalDateRange, useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { withUsageTracking } from '@components/utility/withUsageTracking'
import { DateRangeSelection } from '@blocks/DatePickers/DateSelection/DateRangeSelection'

export type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

const GlobalDateRangeSelectionComponent = ({ showLabels = false, isCompact = false }: GlobalDateRangeSelectionProps) => {
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

export const GlobalDateRangeSelection = withUsageTracking('GlobalDateRangeSelection', GlobalDateRangeSelectionComponent)
