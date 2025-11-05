import { useCallback, useEffect, useRef } from 'react'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DeprecatedDatePicker } from '../DeprecatedDatePicker/DeprecatedDatePicker'
import { DeprecatedDatePickerModeSelector } from '../DeprecatedDatePicker/ModeSelector/DeprecatedDatePickerModeSelector'
import { getAllowedDateRangePickerModes, getInitialDateRangePickerMode, useGlobalDateRangePicker } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'
import { ReportKey, useReportModeActions, useReportModeStore, useReportModeWithFallback } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
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
  const { resetPnLModeToDefaultOnMount } = useReportModeStore()

  const { setModeForReport } = useReportModeActions()

  const setDisplayMode = useCallback((mode: DateRangePickerMode) => {
    setModeForReport(ReportKey.ProfitAndLoss, mode)
  }, [setModeForReport])

  useEffect(() => {
    const initialDatePickerMode = getInitialDateRangePickerMode({ allowedDatePickerModes, defaultDatePickerMode })
    if (!isMounted.current && resetPnLModeToDefaultOnMount && displayMode !== initialDatePickerMode) {
      setDisplayMode(initialDatePickerMode)
    }
    isMounted.current = true
  }, [resetPnLModeToDefaultOnMount, allowedDatePickerModes, defaultDatePickerMode, displayMode, setDisplayMode])

  const cleanedAllowedModes = getAllowedDateRangePickerModes({ allowedDatePickerModes, defaultDatePickerMode })

  const {
    rangeDisplayMode,
    onChangeMode,
    dateOrDateRange,
    onChangeDateOrDateRange,
  } = useGlobalDateRangePicker({ displayMode, setDisplayMode })

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
