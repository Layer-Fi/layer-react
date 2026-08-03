import { useCallback } from 'react'

import { useGetLedgerBalances } from '@api/businesses/[business-id]/ledger/balances/get'
import { useLedgerDateRange } from '@providers/generalLedger/LedgerDateStore/LedgerDateStoreProvider'

type Props = {
  withDates?: boolean
}

export const useChartOfAccounts = ({ withDates = false }: Props = {}) => {
  const { startDate, endDate } = useLedgerDateRange({ dateSelectionMode: 'full' })
  const { data, isLoading, isValidating, isError, mutate } = useGetLedgerBalances({
    startDate: withDates ? startDate : undefined,
    endDate: withDates ? endDate : undefined,
  })

  const refetch = useCallback(async () => {
    await mutate()
  }, [mutate])

  return { data, isLoading, isValidating, isError, refetch }
}
