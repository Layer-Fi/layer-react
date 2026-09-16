import { useGetLedgerBalances } from '@api/businesses/[business-id]/ledger/balances/get'
import { useIsChartOfAccountsDateScoped } from '@providers/features/generalLedger/ChartOfAccountsDateScope/ChartOfAccountsDateScopeProvider'
import { useLedgerDateRange } from '@providers/features/generalLedger/LedgerDateStore/LedgerDateStoreProvider'

export const useChartOfAccountsBalances = () => {
  const isDateScoped = useIsChartOfAccountsDateScoped()
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })

  return useGetLedgerBalances({
    startDate: isDateScoped ? startDate : undefined,
    endDate: isDateScoped ? endDate : undefined,
  })
}
