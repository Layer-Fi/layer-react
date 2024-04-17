import { useState } from 'react'
import { Layer } from '../../api/layer'
import { LedgerAccounts, LedgerAccountsEntry } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseLedgerAccounts = () => {
  data?: LedgerAccounts
  entryData?: LedgerAccountsEntry
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
  accountId?: string
  setAccountId: (id?: string) => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
}

export const useLedgerAccounts: UseLedgerAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [accountId, setAccountId] = useState<string | undefined>()
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId &&
      accountId &&
      auth?.access_token &&
      `ledger-accounts-lines-${businessId}-${accountId}`,
    Layer.getLedgerAccountsLines(apiUrl, auth?.access_token, {
      params: { businessId, accountId },
    }),
  )

  const { data: entryData } = useSWR(
    businessId &&
      selectedEntryId &&
      auth?.access_token &&
      `ledger-accounts-entry-${businessId}-${selectedEntryId}}`,
    Layer.getLedgerAccountsEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId: selectedEntryId },
    }),
  )

  const refetch = () => mutate()

  return {
    data: data?.data,
    entryData: entryData?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    accountId,
    setAccountId,
    selectedEntryId,
    setSelectedEntryId,
  }
}
