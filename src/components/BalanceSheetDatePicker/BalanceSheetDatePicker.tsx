import React from 'react'
import { DatePicker } from '../DatePicker'
import { useGlobalDate, useGlobalDateActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export function BalanceSheetDatePicker() {
  const { date, mode } = useGlobalDate()
  const { set } = useGlobalDateActions()

  return (
    <DatePicker
      selected={date}
      onChange={(date) => {
        if (date instanceof Date) {
          set({ date })
        }
      }}
      mode={mode}
    />
  )
}
