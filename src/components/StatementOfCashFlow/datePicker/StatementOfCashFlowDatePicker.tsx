import { DatePickerModeSelector } from '../../DatePicker/ModeSelector/DatePickerModeSelector'
import type { TimeRangePickerConfig } from '../../../views/Reports/reportTypes'
import { DatePicker } from '../../DatePicker'
import { useLayerContext } from '../../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../../utils/business'
import { getAllowedDateRangePickerModes, useGlobalDateRangePicker } from '../../../providers/GlobalDateStore/useGlobalDateRangePicker'
import { ReportKey, useReportModeActions, useReportModeWithFallback } from '../../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { useCallback } from 'react'
import type { DateRangePickerMode } from '../../../providers/GlobalDateStore/GlobalDateStoreProvider'

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

  const displayMode = useReportModeWithFallback(ReportKey.StatementOfCashFlows, 'monthPicker')
  const { setModeForReport } = useReportModeActions()

  const setDisplayMode = useCallback((mode: DateRangePickerMode) => {
    setModeForReport(ReportKey.StatementOfCashFlows, mode)
  }, [setModeForReport])

  const {
    dateFormat,
    rangeDisplayMode,
    onChangeMode,
    dateOrDateRange,
    onChangeDateOrDateRange,
  } = useGlobalDateRangePicker({ displayMode, setDisplayMode })

  const cleanedAllowedModes = getAllowedDateRangePickerModes({ allowedDatePickerModes, defaultDatePickerMode })

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      selected={dateOrDateRange}
      onChange={onChangeDateOrDateRange}
      displayMode={rangeDisplayMode}
      allowedModes={cleanedAllowedModes}
      onChangeMode={onChangeMode}
      slots={{
        ModeSelector: DatePickerModeSelector,
      }}
      dateFormat={dateFormat}
      customDateRanges={customDateRanges}
      minDate={minDate}
    />
  )
}
