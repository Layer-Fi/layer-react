import { useCallback, useContext } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useGlobalDateRangePicker } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  allowedDatePickerModes,
  customDateRanges,
  defaultDatePickerMode,
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()
  const {
    refetch,
    compareMode,
    comparePeriods,
    rangeDisplayMode,
    setRangeDisplayMode,
  } = useContext(ProfitAndLoss.ComparisonContext)

  const getComparisonData = useCallback((date: Date) => {
    if (compareMode && comparePeriods > 0) {
      refetch({
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      })
    }
  }, [compareMode, comparePeriods, refetch])

  const {
    allowedDateRangePickerModes,
    dateFormat,
    selected,
    setSelected,
    setRangeDisplayMode: setGlobalRangeDisplayMode,
  } = useGlobalDateRangePicker({
    allowedDatePickerModes,
    defaultDatePickerMode,
    /*
     * This is preserves a hack - we need to improve the data-loading for the
     * comparison PnL.
     */
    onSetMonth: getComparisonData,
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
          setRangeDisplayMode(rangeDisplayMode)
          setGlobalRangeDisplayMode({ rangeDisplayMode })
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
