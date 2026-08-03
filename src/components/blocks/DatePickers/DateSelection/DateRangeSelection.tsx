import classNames from 'classnames'

import { type DateRange } from '@utils/date/dateRange'
import type { DatePreset, SelectableDatePreset } from '@utils/date/dateRangePresets'
import { useBusinessDatePickerBounds } from '@hooks/utils/dates/useBusinessDatePickerBounds'
import { DateRangePicker } from '@ui/DatePickers/DatePicker/DateRangePicker'
import { DateSelectionComboBox } from '@blocks/DatePickers/DateSelection/DateSelectionComboBox'

import './dateRangeSelection.scss'

type DateRangeSelectionProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  datePreset: DatePreset
  setDatePreset: (options: { datePreset: SelectableDatePreset }) => void
  showLabels?: boolean
  isCompact?: boolean
  showAllTimeFirst?: boolean
}

export const DateRangeSelection = ({
  dateRange,
  setDateRange,
  datePreset,
  setDatePreset,
  showLabels = false,
  isCompact = false,
  showAllTimeFirst = false,
}: DateRangeSelectionProps) => {
  const { minDate, maxDate } = useBusinessDatePickerBounds()

  return (
    <div
      className={classNames('Layer__DateRangeSelection Layer__variables', {
        'Layer__DateRangeSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        showLabel={showLabels}
        showAllTimeFirst={showAllTimeFirst}
      />
      <DateRangePicker
        dateRange={dateRange}
        setDateRange={setDateRange}
        minDate={minDate}
        maxDate={maxDate}
        showLabels={showLabels}
      />
    </div>
  )
}
