import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { useGlobalDateRangePicker } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  allowedDatePickerModes,
  customDateRanges,
  defaultDatePickerMode,
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()

  const {
    allowedDateRangePickerModes,
    dateFormat,
    selected,
    setSelected,
    rangeDisplayMode,
    setRangeDisplayMode,
  } = useGlobalDateRangePicker({
    allowedDatePickerModes,
    defaultDatePickerMode,
  })

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      selected={selected}
      onChange={(dates) => {
        if (dates instanceof Date) {
          setSelected({ start: dates, end: dates })

          return
        }

        const [start, end] = dates

        setSelected({ start, end: end ?? start })
      }}
      displayMode={rangeDisplayMode}
      allowedModes={allowedDateRangePickerModes}
      onChangeMode={(rangeDisplayMode) => {
        if (rangeDisplayMode !== 'dayPicker') {
          setRangeDisplayMode({ rangeDisplayMode })
        }
      }}
      slots={{
        ModeSelector: DatePickerModeSelector,
      }}
      dateFormat={dateFormat}
      customDateRanges={customDateRanges}
      minDate={minDate}
    />
  )
}
