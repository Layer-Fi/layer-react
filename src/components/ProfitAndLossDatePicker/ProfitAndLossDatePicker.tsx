import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { getAllowedDateRangePickerModes, useGlobalDateRangePicker } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'
import { ReportKey, useReportMode, useReportModeActions } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { useCallback } from 'react'
import { type DateRangePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  allowedDatePickerModes,
  customDateRanges,
  defaultDatePickerMode,
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()

  const displayMode = useReportMode(ReportKey.ProfitAndLoss)
  const { setModeForReport } = useReportModeActions()

  const setDisplayMode = useCallback((mode: DateRangePickerMode) => {
    setModeForReport(ReportKey.ProfitAndLoss, mode)
  }, [setModeForReport])

  const cleanedAllowedModes = getAllowedDateRangePickerModes({ allowedDatePickerModes, defaultDatePickerMode })

  const {
    rangeDisplayMode,
    onChangeMode,
    dateOrDateRange,
    onChangeDateOrDateRange,
    dateFormat,
  } = useGlobalDateRangePicker({ displayMode, setDisplayMode })

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
