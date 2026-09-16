import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { DateRangePicker } from '@ui/DatePickers/DatePicker/DateRangePicker'
import { useBusinessDatePickerBounds } from '@blocks/DatePickers/useBusinessDatePickerBounds'

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
