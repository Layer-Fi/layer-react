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
      defaultSelected={effectiveDate}
      onChange={date => date && setEffectiveDate(date as Date)}
      displayMode='dayPicker'
      syncWithGlobalDate={true}
    />
  )
}
