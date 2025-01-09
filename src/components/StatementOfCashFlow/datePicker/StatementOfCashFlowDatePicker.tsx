import React from 'react'
import { DatePickerModeSelector } from '../../DatePicker/ModeSelector/DatePickerModeSelector'
import type { TimeRangePickerConfig } from '../../../views/Reports/reportTypes'
import { DatePicker } from '../../DatePicker'
import { useLayerContext } from '../../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../../utils/business'
import { useGlobalDateRangePicker } from '../../../providers/GlobalDateStore/useGlobalDateRangePicker'

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

  const {
    allowedDateRangePickerModes,
    dateFormat,
    rangeMode,
    selected,
    setRangeMode,
    setSelected,
  } = useGlobalDateRangePicker({ allowedDatePickerModes, defaultDatePickerMode })

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      selected={selected}
      onChange={(dates) => {
        if (dates instanceof Date) {
          if (rangeMode === 'monthPicker') {
            setSelected({ start: dates, end: dates })
          }

          return
        }

        const [start, end] = dates

        setSelected({ start, end: end ?? start })
      }}
      mode={rangeMode}
      allowedModes={allowedDateRangePickerModes}
      onChangeMode={(rangeMode) => {
        if (rangeMode !== 'dayPicker') {
          setRangeMode({ rangeMode })
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
