import classNames from 'classnames'

import { type DateRange } from '@providers/DateStoreProvider/internal/types'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'

import './globalDateRangeSelection.scss'

type DateRangeSelectionProps = {
  startDate: Date
  endDate: Date
  setDateRange: (range: DateRange) => void
  showLabels?: boolean
  isCompact?: boolean
}

export const DateRangeSelection = ({
  startDate,
  endDate,
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
        startDate={startDate}
        endDate={endDate}
        setDateRange={setDateRange}
        showLabel={showLabels}
      />
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        setDateRange={setDateRange}
        showLabels={showLabels}
      />
    </div>
  )
}
