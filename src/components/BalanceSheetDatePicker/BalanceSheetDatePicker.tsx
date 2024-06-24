import React from 'react'
import { DateDayPicker } from '../DateDayPicker'

export type BalanceSheetDatePickerProps = {
  effectiveDate: Date
  setEffectiveDate: (date: Date) => void
}

export const BalanceSheetDatePicker = ({
  effectiveDate,
  setEffectiveDate,
}: BalanceSheetDatePickerProps) => {
  return (
    <DateDayPicker
      dateDay={effectiveDate}
      changeDateDay={date => setEffectiveDate(date)}
    />
  )
}
