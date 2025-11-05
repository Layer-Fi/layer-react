import { DeprecatedDatePickerModeSelector } from '../../DeprecatedDatePicker/ModeSelector/DeprecatedDatePickerModeSelector'
import type { TimeRangePickerConfig } from '../../../views/Reports/reportTypes'
import { DeprecatedDatePicker } from '../../DeprecatedDatePicker/DeprecatedDatePicker'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
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
    rangeDisplayMode,
    onChangeMode,
    dateOrDateRange,
    onChangeDateOrDateRange,
  } = useGlobalDateRangePicker({ displayMode, setDisplayMode })

  const cleanedAllowedModes = getAllowedDateRangePickerModes({ allowedDatePickerModes, defaultDatePickerMode })

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DeprecatedDatePicker
      selected={dateOrDateRange}
      onChange={onChangeDateOrDateRange}
      displayMode={rangeDisplayMode}
      allowedModes={cleanedAllowedModes}
      onChangeMode={onChangeMode}
      slots={{
        ModeSelector: DeprecatedDatePickerModeSelector,
      }}
      customDateRanges={customDateRanges}
      minDate={minDate}
    />
  )
}
