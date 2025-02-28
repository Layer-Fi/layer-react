import type { TimeRangePickerConfig } from '../../../views/Reports/reportTypes'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useContext } from 'react'
import { StatementOfCashFlowContext } from '../../../contexts/StatementOfCashContext'
import { DatePicker } from '../../DatePicker'
import { DatePickerModeSelector } from '../../DatePicker/ModeSelector/DatePickerModeSelector'
import { getEarliestDateToBrowse } from '../../../utils/business'

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
  const { setDate } = useContext(StatementOfCashFlowContext)

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      onChange={(dates) => {
        console.log('StatementOfCashFlowDatePicker - onChange', dates)
        if (dates instanceof Date) {
          setDate({ startDate: dates, endDate: dates })

          return
        }

        const [start, end] = dates

        setDate({ startDate: start, endDate: end ?? start })
      }}
      displayMode={defaultDatePickerMode}
      allowedModes={allowedDatePickerModes}
      slots={{
        ModeSelector: DatePickerModeSelector,
      }}
      customDateRanges={customDateRanges}
      minDate={minDate}
      syncWithGlobalDate={true}
    />
  )
}
