import React, { useContext } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import { DateMonthPicker } from '../DateMonthPicker'
import { ProfitAndLoss } from '../ProfitAndLoss'

export const ProfitAndLossDatePicker = () => {
  const { business } = useLayerContext()
  const { changeDateRange, dateRange } = useContext(ProfitAndLoss.Context)

  const minDate = getEarliestDateToBrowse(business)

  return (
    <DateMonthPicker
      dateRange={dateRange}
      changeDateRange={changeDateRange}
      minDate={minDate}
    />
  )
}
