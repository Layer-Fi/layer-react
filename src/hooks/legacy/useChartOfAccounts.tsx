import { useCallback } from 'react'

import { useLedgerBalances } from '@hooks/api/businesses/[business-id]/ledger/balances/useLedgerBalances'
import { useLedgerDateRange } from '@providers/DateStoreProvider/LedgerDateStoreProvider'

type Props = {
  withDates?: boolean
}

export const useChartOfAccounts = ({ withDates = false }: Props = {}) => {
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })
  const { data, isLoading, isValidating, isError, mutate } = useLedgerBalances(withDates, startDate, endDate)

  const refetch = useCallback(async () => {
    await mutate()
  }, [mutate])

  return { data, isLoading, isValidating, isError, refetch }
}
