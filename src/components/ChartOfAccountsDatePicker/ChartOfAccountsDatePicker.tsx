import { useContext } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { DeprecatedDatePicker } from '../DeprecatedDatePicker/DeprecatedDatePicker'
import { endOfMonth, startOfMonth } from 'date-fns'

export const ChartOfAccountsDatePicker = () => {
  const { changeDateRange, dateRange } = useContext(ChartOfAccountsContext)

  return (
    <DeprecatedDatePicker
      displayMode='monthPicker'
      selected={dateRange.startDate}
      onChange={(date) => {
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
