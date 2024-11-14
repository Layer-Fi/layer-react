import React, { useContext, useState } from 'react'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import {
  DatePickerMode,
  DEFAULT_ALLOWED_PICKER_MODES,
} from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useBusiness } from '../../hooks/useBusiness'
import { PNLComparisonContext, PNLContext } from '../ProfitAndLoss/ProfitAndLoss'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig

export const ProfitAndLossDatePicker = ({
  allowedDatePickerModes,
  datePickerMode: deprecated_datePickerMode,
  defaultDatePickerMode,
  customDateRanges,
}: ProfitAndLossDatePickerProps) => {
  const { data: business } = useBusiness()
  const { changeDateRange, dateRange } = useContext(PNLContext)
  const { refetch, compareMode, compareMonths } = useContext(
    PNLComparisonContext,
  )

  const [datePickerMode, setDatePickerMode] = useState<DatePickerMode>(
    defaultDatePickerMode ?? deprecated_datePickerMode ?? 'monthPicker',
  )

  const getComparisonData = (date: Date) => {
    if (compareMode && compareMonths > 0) {
      refetch({
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      })
    }
  }

  const minDate = getEarliestDateToBrowse(business)

  if (datePickerMode === 'dayRangePicker') {
    return (
      <DatePicker
        mode={datePickerMode}
        customDateRanges={customDateRanges}
        allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
        onChangeMode={setDatePickerMode}
        selected={[dateRange.startDate, dateRange.endDate]}
        onChange={dateSet => {
          const dates = dateSet as [Date | null, Date | null]
          if (dates.length === 2 && !!dates[0] && !!dates[1]) {
            changeDateRange({
              startDate: dates[0],
              endDate: dates[1],
            })
          }
        }}
        minDate={minDate}
        dateFormat='MMM d'
        slots={{
          ModeSelector: DatePickerModeSelector,
        }}
      />
    )
  }

  return (
    <DatePicker
      mode={datePickerMode}
      customDateRanges={customDateRanges}
      allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
      onChangeMode={setDatePickerMode}
      selected={dateRange.startDate}
      onChange={date => {
        if (!Array.isArray(date)) {
          getComparisonData(date)
          changeDateRange({
            startDate: startOfMonth(date),
            endDate: endOfMonth(date),
          })
        }
      }}
      minDate={minDate}
      slots={{
        ModeSelector: DatePickerModeSelector,
      }}
    />
  )
}
