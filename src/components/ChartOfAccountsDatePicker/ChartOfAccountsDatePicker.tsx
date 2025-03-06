import { useContext } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { DatePicker } from '../DatePicker'
import { endOfMonth, startOfMonth } from 'date-fns'

export const ChartOfAccountsDatePicker = () => {
  const { date, setDate } = useContext(ChartOfAccountsContext)

  return (
    <DatePicker
      displayMode='monthPicker'
      selected={date.startDate}
      onChange={(date) => {
        if (!Array.isArray(date)) {
          setDate({
            startDate: startOfMonth(date),
            endDate: endOfMonth(date),
          })
        }
        else if (date.length === 2 && date[0] && date[1]) {
          setDate({
            startDate: date[0],
            endDate: date[1],
          })
        }
      }}
    />
  )
}
