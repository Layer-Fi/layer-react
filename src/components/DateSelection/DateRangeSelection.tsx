import classNames from 'classnames'

import { type DateRange } from '@utils/date/dateRange'
import type { DatePreset } from '@utils/date/dateRangePresets'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'

import './dateRangeSelection.scss'

type DateRangeSelectionProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  preset: DatePreset
  setPresetRange: (options: { preset: Exclude<DatePreset, DatePreset.Custom> }) => void
  includeAllTime?: boolean
  showLabels?: boolean
  isCompact?: boolean
}

export const DateRangeSelection = ({
  dateRange,
  setDateRange,
  preset,
  setPresetRange,
  includeAllTime = false,
  showLabels = false,
  isCompact = false,
}: DateRangeSelectionProps) => {
  return (
    <div
      className={classNames('Layer__DateRangeSelection', {
        'Layer__DateRangeSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        preset={preset}
        setPresetRange={setPresetRange}
        includeAllTime={includeAllTime}
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
