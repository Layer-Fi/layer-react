import React, { ReactNode } from 'react'
import { DateContext, GlobalDateContext } from '../../contexts/DateContext'
import { useDate } from '../../hooks/useDate'
import { DateState } from '../../types'

interface DateProviderProps {
  children: ReactNode
}

export const DateProvider = ({ children }: DateProviderProps) => {
  const contextData = useDate({})

  return (
    <DateContext.Provider value={contextData}>{children}</DateContext.Provider>
  )
}

export const GlobalDateProvider = ({ children }: DateProviderProps) => {
  const contextData = useDate({
    name: 'GlobalDateProvider',
    period: 'CUSTOM',
    mode: 'dayRangePicker',
  })

  return (
    <GlobalDateContext.Provider value={contextData}>
      {children}
    </GlobalDateContext.Provider>
  )
}
