import { DatePicker } from '../DatePicker'
import { useGlobalDate, useGlobalDateActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { ReportKey, useReportMode } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'

export function BalanceSheetDatePicker() {
  const { date } = useGlobalDate()
  const { setDate } = useGlobalDateActions()
  const displayMode = useReportMode(ReportKey.BalanceSheet)

  return (
    <DatePicker
      selected={date}
      onChange={(date) => {
        if (date instanceof Date) {
          setDate({ date })
        }
      }}
      displayMode={displayMode}
    />
  )
}
