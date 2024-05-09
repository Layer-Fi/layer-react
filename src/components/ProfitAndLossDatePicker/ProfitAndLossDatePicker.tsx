import React, { useContext } from 'react'
import { DateMonthPicker } from '../DateMonthPicker'
import { ProfitAndLoss } from '../ProfitAndLoss'

export const ProfitAndLossDatePicker = () => {
  const { changeDateRange, dateRange } = useContext(ProfitAndLoss.Context)

  return (
    <DateMonthPicker dateRange={dateRange} changeDateRange={changeDateRange} />
  )
}
