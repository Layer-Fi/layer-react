import { useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { LedgerAccounts, LedgerAccountsEntry } from '../../types'
import { DataModel } from '../../types/general'
import useSWR from 'swr'
import { useAuth } from '../useAuth'

type UseLedgerAccounts = (showReversalEntries: boolean) => {
  data?: LedgerAccounts
  entryData?: LedgerAccountsEntry
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => void
  accountId?: string
  setAccountId: (id?: string) => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
}

export const useLedgerAccounts: UseLedgerAccounts = (
  showReversalEntries: boolean = false,
) => {
  const { businessId, apiUrl, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { data: auth } = useAuth()

  const [accountId, setAccountId] = useState<string | undefined>()
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const queryKey =
    businessId &&
    accountId &&
    auth?.access_token &&
    `ledger-accounts-lines-${businessId}-${accountId}`

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
    Layer.getLedgerAccountsLines(apiUrl, auth?.access_token, {
      params: {
        businessId,
        accountId,
        includeReversals: showReversalEntries ? 'true' : undefined,
      },
    }),
  )

  const {
    data: entryData,
    mutate: mutateEntryData,
    isLoading: isLoadingEntry,
    isValidating: isValdiatingEntry,
    error: errorEntry,
  } = useSWR(
    businessId &&
      selectedEntryId &&
      auth?.access_token &&
      `ledger-accounts-entry-${businessId}-${selectedEntryId}}`,
    Layer.getLedgerAccountsEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId: selectedEntryId },
    }),
  )

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
    mutateEntryData()
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.LEDGER_ACCOUNTS, queryKey)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  }, [syncTimestamps, accountId])

  return {
    data: data?.data,
    entryData: entryData?.data,
    isLoading,
    isLoadingEntry,
    isValidating,
    isValdiatingEntry,
    error,
    errorEntry,
    refetch,
    accountId,
    setAccountId,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
  }
}
