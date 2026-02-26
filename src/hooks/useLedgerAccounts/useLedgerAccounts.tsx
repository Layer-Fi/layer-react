import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

import type { LedgerAccountBalanceWithNodeType } from '@internal-types/chart_of_accounts'
import { DataModel } from '@internal-types/general'
import { type LedgerAccountLineItem, type LedgerAccountsEntry } from '@internal-types/ledger_accounts'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type ListLedgerAccountLinesReturn, useListLedgerAccountLines } from '@features/ledger/accounts/[ledgerAccountId]/api/useListLedgerAccountLines'

type UseLedgerAccounts = (showReversalEntries: boolean) => {
  data?: LedgerAccountLineItem[] | undefined
  entryData?: LedgerAccountsEntry
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => Promise<ListLedgerAccountLinesReturn[] | undefined>
  selectedAccount: LedgerAccountBalanceWithNodeType | undefined
  setSelectedAccount: (account: LedgerAccountBalanceWithNodeType | undefined) => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  hasMore: boolean
  fetchMore: () => void
}

export const useLedgerAccounts: UseLedgerAccounts = () => {
  const { businessId, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccountBalanceWithNodeType | undefined>()
  const selectedAccountId = selectedAccount?.accountId

  // Use the new paginated hook - always call it but with empty accountId when not available
  const {
    data: paginatedData,
    isLoading: paginationIsLoading,
    isValidating: paginationIsValidating,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error: paginationError,
    mutate,
    size,
    setSize,
  } = useListLedgerAccountLines({
    accountId: selectedAccountId || '',
    include_child_account_lines: true,
    sort_by: 'entry_at',
    sort_order: 'DESC',
    limit: 150,
  })

  // Only use the data when accountId is available
  const shouldFetch = Boolean(selectedAccountId)

  const data = useMemo(() => {
    if (!paginatedData || !shouldFetch) return undefined
    return paginatedData.flatMap(page => page.data)
  }, [paginatedData, shouldFetch])

  const hasMore = useMemo(() => {
    if (!shouldFetch || !paginatedData || paginatedData.length === 0) return false

    const lastPage = paginatedData[paginatedData.length - 1]
    return Boolean(
      lastPage?.meta?.pagination.cursor
      && lastPage?.meta?.pagination.has_more,
    )
  }, [paginatedData, shouldFetch])

  const fetchMore = useCallback(() => {
    if (hasMore && shouldFetch) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size, shouldFetch])

  const {
    data: entryData,
    mutate: mutateEntryData,
    isLoading: isLoadingEntry,
    isValidating: isValdiatingEntry,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error: errorEntry,
  } = useSWR(
    businessId
    && selectedEntryId
    && auth?.access_token
    && `ledger-accounts-entry-${businessId}-${selectedEntryId}}`,
    Layer.getLedgerAccountsEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId: selectedEntryId },
    }),
  )

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
    void mutateEntryData()
  }

  // Create a query key for the data model tracking (similar to original)
  const queryKey = useMemo(() => {
    return businessId
      && selectedAccountId
      && auth?.access_token
      && `ledger-accounts-lines-${businessId}-${selectedAccountId}`
  }, [businessId, selectedAccountId, auth?.access_token])

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && shouldFetch && (paginationIsLoading || paginationIsValidating)) {
      read(DataModel.LEDGER_ACCOUNTS, queryKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationIsLoading, paginationIsValidating, shouldFetch])

  useEffect(() => {
    if (queryKey && shouldFetch && hasBeenTouched(queryKey)) {
      void refetch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTimestamps, selectedAccountId, shouldFetch])

  return {
    data,
    entryData: entryData?.data,
    isLoading: shouldFetch ? paginationIsLoading : false,
    isLoadingEntry,
    isValidating: shouldFetch ? paginationIsValidating : false,
    isValidatingEntry: isValdiatingEntry,
    error: shouldFetch ? paginationError : undefined,
    errorEntry,
    refetch,
    selectedAccount,
    setSelectedAccount,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    hasMore,
    fetchMore,
  }
}
