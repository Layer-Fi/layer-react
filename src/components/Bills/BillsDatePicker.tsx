import { DatePicker } from '../DatePicker/DatePicker'
import { useBillsContext } from '../../contexts/BillsContext'

export const BillsDatePicker = () => {
  const { dateRange, setDateRange } = useBillsContext()

  return (
    <DatePicker
      displayMode='monthRangePicker'
      selected={[dateRange.startDate, dateRange.endDate]}
      onChange={(e) => {
        if (Array.isArray(e) && e[0] && e[1]) {
          setDateRange({
            startDate: e[0],
            endDate: e[1],
          })
        }
      }}
      wrapperClassName='Layer__bills__main-datepicker'
    />
  )
}
