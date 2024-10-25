import { createContext, useContext } from 'react'
import { useDate } from '../../hooks/useDate'
import { DatePeriod, DateRange } from '../../types'
import { endOfMonth, startOfMonth } from 'date-fns'

export type DateContextType = ReturnType<typeof useDate>

export const DateContext = createContext<DateContextType>({
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  setDateRange: (_dateRange: DateRange<Date | undefined>) => true,
  datePeriod: 'MONTH',
  setDatePeriod: (_datePeriod: DatePeriod) => {},
})

export const GlobalDateContext = createContext<DateContextType>({
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  setDateRange: (_dateRange: DateRange<Date | undefined>) => true,
  datePeriod: 'MONTH',
  setDatePeriod: (_datePeriod: DatePeriod) => {},
})

export const useDateContext = () => {
  const context = useContext(DateContext)

  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider')
  }

  return context
}

export const useGlobalDateContext = () => {
  const context = useContext(GlobalDateContext)

  if (!context) {
    throw new Error(
      'useGlboalDateContext must be used within a GlobalDateProvider',
    )
  }

  return context
}
