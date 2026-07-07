import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'

export const GlobalDateRangePicker = ({ showLabels = false }: { showLabels?: boolean }) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  return (
    <DateRangePicker
      dateRange={dateRange}
      setDateRange={setDateRange}
      showLabels={showLabels}
    />
  )
}
