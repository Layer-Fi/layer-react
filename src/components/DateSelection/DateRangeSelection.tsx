import classNames from 'classnames'

import { type DateRange } from '@utils/date/dateRange'
import type { DatePreset, SelectableDatePreset } from '@utils/date/dateRangePresets'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'

import './dateRangeSelection.scss'

type DateRangeSelectionProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  datePreset: DatePreset
  setDatePreset: (options: { datePreset: SelectableDatePreset }) => void
  showLabels?: boolean
  isCompact?: boolean
}

export const DateRangeSelection = ({
  dateRange,
  setDateRange,
  datePreset,
  setDatePreset,
  showLabels = false,
  isCompact = false,
}: DateRangeSelectionProps) => {
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
      />
      <DateRangePicker
        dateRange={dateRange}
        setDateRange={setDateRange}
        showLabels={showLabels}
      />
    </div>
  )
}
