import React from 'react'
import { DatePicker } from '../DatePicker'

export type BalanceSheetDatePickerProps = {
  effectiveDate: Date
  setEffectiveDate: (date: Date) => void
  syncWithGlobalDate?: boolean
}

export const BalanceSheetDatePicker = ({
  effectiveDate,
  setEffectiveDate,
  syncWithGlobalDate,
}: BalanceSheetDatePickerProps) => {
  return (
    <>
      <DatePicker
        selected={effectiveDate}
        onChange={date => date && setEffectiveDate(date as Date)}
        mode='dayPicker'
        syncWithGlobalDate={syncWithGlobalDate}
      />
    </>
  )
}
