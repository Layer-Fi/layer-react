import { useCallback, useMemo, useState } from 'react'

import type { LedgerAccountBalanceWithNodeType } from '@internal-types/chartOfAccounts'
import { type LedgerAccountLineItem, type LedgerAccountsEntry } from '@internal-types/ledgerAccounts'
import { type ListLedgerAccountLinesReturn, useListLedgerAccountLines } from '@hooks/api/businesses/[business-id]/ledger/accounts/[account-id]/lines/useListLedgerAccountLines'
import { useLedgerAccountsEntry } from '@hooks/api/businesses/[business-id]/ledger/entries/[entry-id]/useLedgerAccountsEntry'

type UseLedgerAccounts = () => {
  data?: LedgerAccountLineItem[] | undefined
  entryData?: LedgerAccountsEntry
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  isError?: boolean
  isErrorEntry?: boolean
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
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccountBalanceWithNodeType | undefined>()
  const selectedAccountId = selectedAccount?.accountId

  // Use the new paginated hook - always call it but with empty accountId when not available
  const {
    data: paginatedData,
    isLoading: paginationIsLoading,
    isValidating: paginationIsValidating,
    isError,
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
  const shouldFetch = !!selectedAccountId

  const data = useMemo(() => {
    if (!paginatedData || !shouldFetch) return undefined
    return paginatedData.flatMap(page => page.data)
  }, [paginatedData, shouldFetch])

  const hasMore = useMemo(() => {
    if (!shouldFetch || !paginatedData || paginatedData.length === 0) return false

    const lastPage = paginatedData[paginatedData.length - 1]
    return !!(lastPage.meta?.pagination.cursor && lastPage.meta?.pagination.has_more)
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
    isError: isErrorEntry,
  } = useLedgerAccountsEntry({ entryId: selectedEntryId })

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
    void mutateEntryData()
  }

  return {
    data,
    entryData: entryData?.data,
    isLoading: shouldFetch ? paginationIsLoading : false,
    isLoadingEntry,
    isValidating: shouldFetch ? paginationIsValidating : false,
    isValidatingEntry: isValdiatingEntry,
    isError: shouldFetch && isError,
    isErrorEntry,
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
