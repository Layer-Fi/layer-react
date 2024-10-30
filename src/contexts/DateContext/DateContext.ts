import { createContext, useContext } from 'react'
import { useDate } from '../../hooks/useDate'
import { DateState } from '../../types'
import { endOfMonth, startOfMonth } from 'date-fns'

export type DateContextType = ReturnType<typeof useDate>

export const DateContext = createContext<DateContextType>({
  date: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    period: 'MONTH',
    mode: 'monthPicker',
  },
  setDate: (_dateRange: Partial<DateState>) => true,
})

export const GlobalDateContext = createContext<DateContextType>({
  date: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    period: 'CUSTOM',
    mode: 'dayRangePicker',
  },
  setDate: (_dateRange: Partial<DateState>) => true,
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
