import React, { useContext } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import { DatePicker } from '../DatePicker'
import { DatePickerMode } from '../DatePicker/DatePicker'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { endOfMonth, startOfMonth } from 'date-fns'

export type ProfitAndLossDatePickerProps = {
  datePickerMode?: DatePickerMode
}

export const ProfitAndLossDatePicker = ({
  datePickerMode = 'monthPicker',
}: ProfitAndLossDatePickerProps) => {
  const { business } = useLayerContext()
  const { changeDateRange, dateRange } = useContext(ProfitAndLoss.Context)
  const { refetch, compareMode, compareMonths } = useContext(
    ProfitAndLoss.ComparisonContext,
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
      />
    )
  }

  return (
    <DatePicker
      mode={datePickerMode}
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
    />
  )
}
