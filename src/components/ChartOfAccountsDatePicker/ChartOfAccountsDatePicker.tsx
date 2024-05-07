import React, { useContext } from 'react'
import { ChartOfAccountsContext } from '../ChartOfAccounts'
import { DateMonthPicker } from '../DateMonthPicker'

export const ChartOfAccountsDatePicker = () => {
  const { changeDateRange, dateRange } = useContext(ChartOfAccountsContext)

  return (
    <DateMonthPicker dateRange={dateRange} changeDateRange={changeDateRange} />
  )
}
