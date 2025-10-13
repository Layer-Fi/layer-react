import { DeprecatedDatePicker } from '../DeprecatedDatePicker/DeprecatedDatePicker'
import { useGlobalDate, useGlobalDateActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { ReportKey, useReportModeWithFallback } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'

export function BalanceSheetDatePicker() {
  const { date } = useGlobalDate()
  const { setDate } = useGlobalDateActions()
  const displayMode = useReportModeWithFallback(ReportKey.BalanceSheet, 'dayPicker')

  return (
    <DeprecatedDatePicker
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
