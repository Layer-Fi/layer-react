import React, { useContext, useEffect } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import { DatePicker } from '../DatePicker'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { endOfMonth, startOfMonth } from 'date-fns'

export const ProfitAndLossDatePicker = () => {
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

  return (
    <DatePicker
      mode='monthPicker'
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
