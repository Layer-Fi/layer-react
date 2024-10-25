import { useState } from 'react'
import { DatePeriod, DateRange } from '../../types'
import { endOfMonth, isAfter, isBefore, startOfMonth } from 'date-fns'

type Props = {
  startDate?: Date
  endDate?: Date
  period?: DatePeriod
}

type UseDate = (props: Props) => {
  dateRange: DateRange
  setDateRange: (dateRange: DateRange<Date | undefined>) => boolean
  datePeriod: DatePeriod
  setDatePeriod: (datePeriod: DatePeriod) => void
}

export const useDate: UseDate = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  period: initialPeriod,
}: Props) => {
  const [datePeriod, setDatePeriod] = useState(initialPeriod ?? 'MONTH')
  const [dateRange, setDateRangeState] = useState<DateRange>({
    startDate: initialStartDate ?? startOfMonth(new Date()),
    endDate: initialEndDate ?? endOfMonth(new Date()),
  })

  const setDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: DateRange<Date | undefined>) => {
    if (newStartDate && newEndDate && !isAfter(newStartDate, newEndDate)) {
      setDateRangeState({ startDate: newStartDate, endDate: newEndDate })
      return true
    }

    if (
      newStartDate &&
      !newEndDate &&
      !isAfter(newStartDate, dateRange.endDate)
    ) {
      setDateRangeState({ startDate: newStartDate, endDate: dateRange.endDate })
      return true
    }

    if (
      !newStartDate &&
      newEndDate &&
      !isBefore(newEndDate, dateRange.startDate)
    ) {
      setDateRangeState({ startDate: dateRange.startDate, endDate: newEndDate })
      return true
    }

    return false
  }

  return {
    dateRange,
    setDateRange: setDateRange,
    datePeriod: datePeriod,
    setDatePeriod: setDatePeriod,
  }
}
