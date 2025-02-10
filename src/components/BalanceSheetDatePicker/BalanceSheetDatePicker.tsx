import { DatePicker } from '../DatePicker'

export type BalanceSheetDatePickerProps = {
  effectiveDate: Date
  setEffectiveDate: (date: Date) => void
}

export function BalanceSheetDatePicker({
  effectiveDate,
  setEffectiveDate,
}: BalanceSheetDatePickerProps) {
  return (
    <DatePicker
      selected={effectiveDate}
      onChange={date => date && setEffectiveDate(date as Date)}
      displayMode='dayPicker'
    />
  )
}
