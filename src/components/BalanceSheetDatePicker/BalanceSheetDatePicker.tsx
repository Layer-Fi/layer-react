import { DatePicker } from '../DatePicker'
import { useGlobalDate, useGlobalDateActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export function BalanceSheetDatePicker() {
  const { date, displayMode } = useGlobalDate()
  const { set } = useGlobalDateActions()

  return (
    <DatePicker
      selected={date}
      onChange={(date) => {
        if (date instanceof Date) {
          set({ date })
        }
      }}
      displayMode={displayMode}
    />
  )
}
