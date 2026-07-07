import classNames from 'classnames'

import { type DateRange } from '@utils/date/dateRange'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'

import './globalDateRangeSelection.scss'

type DateRangeSelectionProps = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  showLabels?: boolean
  isCompact?: boolean
}

export const DateRangeSelection = ({
  dateRange,
  setDateRange,
  showLabels = false,
  isCompact = false,
}: DateRangeSelectionProps) => {
  return (
    <div
      className={classNames('Layer__GlobalDateRangeSelection', {
        'Layer__GlobalDateRangeSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        dateRange={dateRange}
        setDateRange={setDateRange}
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
