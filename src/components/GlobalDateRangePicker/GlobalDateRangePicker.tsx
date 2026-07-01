import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'

export const GlobalDateRangePicker = ({ showLabels = false }: { showLabels?: boolean }) => {
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      setDateRange={setDateRange}
      showLabels={showLabels}
    />
  )
}
