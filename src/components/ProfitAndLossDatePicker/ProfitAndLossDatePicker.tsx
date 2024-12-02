import React, { useContext, useState } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import {
  DatePickerMode,
  DEFAULT_ALLOWED_PICKER_MODES,
} from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { endOfMonth, endOfQuarter, endOfYear, startOfMonth, startOfQuarter, startOfYear } from 'date-fns'
import { Select } from '../Input'
import { Period } from '../../hooks/useProfitAndLoss/useProfitAndLoss'

export type ProfitAndLossDatePickerProps = TimeRangePickerConfig & { enablePeriods?: boolean }

const PERIOD_OPTIONS = [
  { label: 'Compare 12 months', value: 'month' },
  { label: 'Compare quarter', value: 'quarter' },
  { label: 'Compare year', value: 'year' },
]

const getDateRange = (date: Date, mode: DatePickerMode) => {
  switch(mode) {
    case 'quarterPicker':
      return {
        startDate: startOfQuarter(date),
        endDate: endOfQuarter(date),
      }
    case 'yearPicker':
      return {
        startDate: startOfYear(date),
        endDate: endOfYear(date),
      }
    default:
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      }
  }
}

export const ProfitAndLossDatePicker = ({
  allowedDatePickerModes,
  datePickerMode: deprecated_datePickerMode,
  defaultDatePickerMode,
  customDateRanges,
  enablePeriods = false,
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()
  const { changeDateRange, dateRange, period, setPeriod } = useContext(ProfitAndLoss.Context)
  const { refetch, compareMode, compareMonths } = useContext(
    ProfitAndLoss.ComparisonContext,
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
    <div className='Layer__datepicker__container'>
      {enablePeriods && (
        <div className='Layer__period-select__container'>
          <Select
            options={PERIOD_OPTIONS}
            value={PERIOD_OPTIONS.find(x => x.value === period)}
            onChange={(val) => {
              setPeriod(val.value as Period)
              switch(val.value) {
                case 'month':
                  setDatePickerMode('monthPicker')
                  break
                case 'quarter':
                  setDatePickerMode('quarterPicker')
                  break
                case 'year':
                  setDatePickerMode('yearPicker')
                  break

                default:
                  break
              }
            }}
          />
        </div>
      )}

      <DatePicker
        mode={datePickerMode}
        customDateRanges={customDateRanges}
        allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
        onChangeMode={setDatePickerMode}
        selected={dateRange.startDate}
        onChange={date => {
          if (!Array.isArray(date)) {
            getComparisonData(date)
            changeDateRange(getDateRange(date, datePickerMode))
          }
        }}
        minDate={minDate}
        slots={{
          ModeSelector: DatePickerModeSelector,
        }}
      />
    </div>
  )
}
