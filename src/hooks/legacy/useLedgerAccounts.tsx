import { useCallback, useState } from 'react'

import type { LedgerAccountBalanceWithNodeType } from '@internal-types/chartOfAccounts'
import { type LedgerAccountLineItem, type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { type ListLedgerAccountLinesReturn, useListLedgerAccountLines } from '@hooks/api/businesses/[business-id]/ledger/accounts/[account-id]/lines/useListLedgerAccountLines'
import { useLedgerAccountsEntry } from '@hooks/api/businesses/[business-id]/ledger/entries/[entry-id]/useLedgerAccountsEntry'

type UseLedgerAccounts = () => {
  data?: LedgerAccountLineItem[] | undefined
  entryData?: LedgerEntry
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
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
    flattenedData,
    isLoading: paginationIsLoading,
    isValidating: paginationIsValidating,
    isError,
    mutate,
    hasMore: rawHasMore,
    fetchMore: rawFetchMore,
  } = useListLedgerAccountLines({
    accountId: selectedAccountId || '',
    include_child_account_lines: true,
    sort_by: 'entry_at',
    sort_order: 'DESC',
    limit: 150,
    isEnabled: Boolean(selectedAccountId),
  })

  // Only use the data when accountId is available
  const shouldFetch = Boolean(selectedAccountId)

  const data = shouldFetch ? flattenedData : undefined
  const hasMore = shouldFetch && rawHasMore

  const fetchMore = useCallback(() => {
    if (shouldFetch) {
      rawFetchMore()
    }
  }, [rawFetchMore, shouldFetch])

  const {
    data: entryData,
    mutate: mutateEntryData,
    isLoading: isLoadingEntry,
    isError: isErrorEntry,
  } = useLedgerAccountsEntry({ entryId: selectedEntryId, isEnabled: Boolean(selectedEntryId) })

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
