import { useCallback, useEffect, useRef } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { getAllowedDateRangePickerModes, getInitialDateRangePickerMode, useGlobalDateRangePicker } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'
import { ReportKey, useReportModeActions, useReportModeWithFallback } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { type DateRangePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  allowedDatePickerModes,
  customDateRanges,
  defaultDatePickerMode,
}: ProfitAndLossDatePickerProps) => {
  const isMounted = useRef(false)
  const { business } = useLayerContext()

  const displayMode = useReportModeWithFallback(ReportKey.ProfitAndLoss, 'monthPicker')

  const { setModeForReport } = useReportModeActions()

  const setDisplayMode = useCallback((mode: DateRangePickerMode) => {
    setModeForReport(ReportKey.ProfitAndLoss, mode)
  }, [setModeForReport])

  useEffect(() => {
    const initialDatePickerMode = getInitialDateRangePickerMode({ allowedDatePickerModes, defaultDatePickerMode })
    if (!isMounted.current && displayMode !== initialDatePickerMode) {
      setDisplayMode(initialDatePickerMode)
    }
    isMounted.current = true
  }, [allowedDatePickerModes, defaultDatePickerMode, displayMode, setDisplayMode])

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
