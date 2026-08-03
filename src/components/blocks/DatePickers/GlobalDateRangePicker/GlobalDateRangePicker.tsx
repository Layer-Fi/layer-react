import { useBusinessDatePickerBounds } from '@hooks/utils/dates/useBusinessDatePickerBounds'
import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateRangePicker } from '@ui/DatePickers/DatePicker/DateRangePicker'

export const GlobalDateRangePicker = ({ showLabels = false }: { showLabels?: boolean }) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()
  const { minDate, maxDate } = useBusinessDatePickerBounds()

  return (
    <DateRangePicker
      dateRange={dateRange}
      setDateRange={setDateRange}
      minDate={minDate}
      maxDate={maxDate}
      showLabels={showLabels}
    />
  )
}
