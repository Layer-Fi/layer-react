import type { TimeRangePickerConfig } from '../../../views/Reports/reportTypes'
import { useLayerContext } from '../../../contexts/LayerContext'

type StatementOfCashFlowDatePickerProps = Pick<
  TimeRangePickerConfig,
  'allowedDatePickerModes' | 'customDateRanges' | 'defaultDatePickerMode'
>

export function StatementOfCashFlowDatePicker({
  allowedDatePickerModes,
  customDateRanges,
  defaultDatePickerMode,
}: StatementOfCashFlowDatePickerProps) {
  const { business } = useLayerContext()

  return null

  // const {
  //   allowedDateRangePickerModes,
  //   dateFormat,
  //   rangeDisplayMode,
  //   selected,
  //   setRangeDisplayMode,
  //   setSelected,
  // } = useGlobalDateRangePicker({ allowedDatePickerModes, defaultDatePickerMode })

  // const minDate = getEarliestDateToBrowse(business)

  // return (
  //   <DatePicker
  //     selected={selected}
  //     onChange={(dates) => {
  //       if (dates instanceof Date) {
  //         if (rangeDisplayMode === 'monthPicker') {
  //           setSelected({ start: dates, end: dates })
  //         }

  //         return
  //       }

  //       const [start, end] = dates

  //       setSelected({ start, end: end ?? start })
  //     }}
  //     displayMode={rangeDisplayMode}
  //     allowedModes={allowedDateRangePickerModes}
  //     onChangeMode={(rangeDisplayMode) => {
  //       if (rangeDisplayMode !== 'dayPicker') {
  //         setRangeDisplayMode({ rangeDisplayMode })
  //       }
  //     }}
  //     slots={{
  //       ModeSelector: DatePickerModeSelector,
  //     }}
  //     dateFormat={dateFormat}
  //     customDateRanges={customDateRanges}
  //     minDate={minDate}
  //   />
  // )
}
