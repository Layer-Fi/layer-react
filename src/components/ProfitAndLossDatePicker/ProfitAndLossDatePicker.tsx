import React, { useContext, useEffect } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import { DatePicker } from '../DatePicker'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { endOfMonth, startOfMonth } from 'date-fns'

export const ProfitAndLossDatePicker = () => {
  const { business } = useLayerContext()
  const { changeDateRange, dateRange } = useContext(ProfitAndLoss.Context)

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DatePicker
      mode='monthPicker'
      selected={dateRange.startDate}
      onChange={date => {
        if (!Array.isArray(date)) {
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
