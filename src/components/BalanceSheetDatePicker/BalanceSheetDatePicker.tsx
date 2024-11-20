import React from 'react'
import { DatePicker } from '../DatePicker'

export type BalanceSheetDatePickerProps = {
  effectiveDate: Date
  setEffectiveDate: (date: Date) => void
  syncWithGlobalDate?: boolean
  customDateProvider?: boolean
}

export const BalanceSheetDatePicker = ({
  effectiveDate,
  setEffectiveDate,
  syncWithGlobalDate,
  customDateProvider = false,
}: BalanceSheetDatePickerProps) => {
  return (
    <>
      <DatePicker
        selected={effectiveDate}
        onChange={date => date && setEffectiveDate(date as Date)}
        mode='dayPicker'
        syncWithGlobalDate={syncWithGlobalDate}
        customDateProvider={customDateProvider}
      />
    </>
  )
}
