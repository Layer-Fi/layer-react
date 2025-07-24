import { useEffect, useState, useMemo, useCallback } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { LedgerAccounts, LedgerAccountsEntry } from '../../types'
import { DataModel } from '../../types/general'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useListLedgerAccountLines } from '../../features/ledger/accounts/[ledgerAccountId]/api/useListLedgerAccountLines'
import type { LedgerAccountBalanceWithNodeType } from '../../types/chart_of_accounts'

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
  selectedAccount: LedgerAccountBalanceWithNodeType | undefined
  setSelectedAccount: (account: LedgerAccountBalanceWithNodeType | undefined) => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  hasMore: boolean
  fetchMore: () => void
}

export const useLedgerAccounts: UseLedgerAccounts = (
  showReversalEntries: boolean = false,
) => {
  const { businessId, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccountBalanceWithNodeType | undefined>()
  const selectedAccountId = selectedAccount?.id

  // Use the new paginated hook - always call it but with empty accountId when not available
  const {
    data: paginatedData,
    isLoading: paginationIsLoading,
    isValidating: paginationIsValidating,
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
    return paginatedData.flatMap(page => page.data) as LedgerAccounts
  }, [paginatedData, shouldFetch, showReversalEntries])

  const hasMore = useMemo(() => {
    if (!shouldFetch || !paginatedData || paginatedData.length === 0) return false

    const lastPage = paginatedData[paginatedData.length - 1]
    return Boolean(
      lastPage.meta?.pagination.cursor
      && lastPage.meta?.pagination.has_more,
    )
  }, [paginatedData, shouldFetch])

  const fetchMore = useCallback(() => {
    if (hasMore && shouldFetch) {
      setSize(size + 1)
    }
  }, [hasMore, setSize, size, shouldFetch])

  const {
    data: entryData,
    mutate: mutateEntryData,
    isLoading: isLoadingEntry,
    isValidating: isValdiatingEntry,
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
