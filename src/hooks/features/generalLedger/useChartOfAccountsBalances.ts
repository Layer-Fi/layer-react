import { useGetLedgerBalances } from '@api/businesses/[business-id]/ledger/balances/get'
import { useLedgerDateRange } from '@providers/features/generalLedger/LedgerDateStore/LedgerDateStoreProvider'

type UseChartOfAccountsBalancesOptions = {
  filterByDateRange?: boolean
}

// Every Chart of Accounts consumer has to resolve the same SWR key, so the date
// scoping decision lives here rather than at each call site.
export const useChartOfAccountsBalances = (
  { filterByDateRange = false }: UseChartOfAccountsBalancesOptions = {},
) => {
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })

  return useGetLedgerBalances({
    startDate: filterByDateRange ? startDate : undefined,
    endDate: filterByDateRange ? endDate : undefined,
  })
}
