import classNames from 'classnames'

import { type DateRange } from '@utils/shared/date/dateRange'
import type { DatePreset, SelectableDatePreset } from '@utils/shared/date/dateRangePresets'
import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DateRangePicker } from '@ui/DatePickers/DatePicker/DateRangePicker'
import { DateSelectionComboBox } from '@blocks/DatePickers/DateSelection/DateSelectionComboBox'
import { useBusinessDatePickerBounds } from '@blocks/DatePickers/useBusinessDatePickerBounds'

import './dateRangeSelection.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__DateRangeSelection': 'Layer__GlobalDateRangeSelection',
  'state:compact': ['Layer__GlobalDateRangeSelection--compact', 'Layer__DateRangeSelection--compact'],
  /* Briefly a size-derived modifier; compact is the prop that replaced it on mobile widths. */
  'state:mobile': 'Layer__GlobalDateRangeSelection--mobile',
} satisfies LegacyClassNameMapFor<'Layer__DateRangeSelection', `state:${string}`>)

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
  const { isMobile } = useSizeClass()

  return (
    <div
      className={classNames(
        legacyClassNames(
          'Layer__DateRangeSelection',
          isCompact && 'state:compact',
          isMobile && 'state:mobile',
        ),
        'Layer__variables',
      )}
      {...toDataProperties({ compact: isCompact })}
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
