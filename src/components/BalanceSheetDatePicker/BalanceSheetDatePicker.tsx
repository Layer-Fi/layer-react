import React from 'react'
import { DatePicker } from '../DatePicker'

export type BalanceSheetDatePickerProps = {
  effectiveDate: Date
  setEffectiveDate: (date: Date) => void
}

export const BalanceSheetDatePicker = ({
  effectiveDate,
  setEffectiveDate,
}: BalanceSheetDatePickerProps) => {
  return (
    <>
      <DatePicker
        selected={effectiveDate}
        onChange={date => {
          if (date) setEffectiveDate(date as Date)
        }}
        mode='dayPicker'
      />
    </>
  )
}
