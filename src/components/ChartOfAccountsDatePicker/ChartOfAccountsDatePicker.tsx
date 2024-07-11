import React, { useContext } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { DatePicker } from '../DatePicker'
import { endOfMonth, startOfMonth } from 'date-fns'

export const ChartOfAccountsDatePicker = () => {
  const { changeDateRange, dateRange } = useContext(ChartOfAccountsContext)

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
    />
  )
}
