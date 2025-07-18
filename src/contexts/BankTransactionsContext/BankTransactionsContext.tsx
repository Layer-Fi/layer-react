import { createContext, useContext } from 'react'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsBulkSelection } from '../../hooks/useBankTransactionsBulkSelection'
import { DisplayState } from '../../types'

export type BankTransactionsContextType = ReturnType<typeof useAugmentedBankTransactions>
export const BankTransactionsContext =
  createContext<BankTransactionsContextType>({
    data: undefined,
    isLoading: false,
    isValidating: false,
    error: undefined,
    refetch: () => {},
    categorize: () => Promise.resolve(undefined),
    categorizeMultiple: () => Promise.resolve({ successful: [], failed: [], successCount: 0, failureCount: 0 }),
    match: () => Promise.resolve(undefined),
    filters: undefined,
    setFilters: () => {},
    metadata: {
      pagination: {
        cursor: undefined,
        has_more: false,
      },
    },
    updateOneLocal: () => undefined,
    shouldHideAfterCategorize: () => false,
    removeAfterCategorize: () => undefined,
    display: DisplayState.review,
    fetchMore: () => {},
    hasMore: false,
    accountsList: [],
  })

// Bulk Selection Context
export type BankTransactionsBulkSelectionContextType = ReturnType<typeof useBankTransactionsBulkSelection>
export const BankTransactionsBulkSelectionContext = createContext<BankTransactionsBulkSelectionContextType>({
  selectedTransactions: [],
  bulkSelectionActive: false,
  addTransaction: () => {},
  removeTransaction: () => {},
  clearSelection: () => {},
  toggleTransaction: () => {},
  selectAll: () => {},
  deselectAll: () => {},
  isSelected: () => false,
  getPageSelectionState: () => ({ allSelected: false, someSelected: false, indeterminate: false }),
  openBulkSelection: () => {},
  closeBulkSelection: () => {},
})

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)

export const useBankTransactionsBulkSelectionContext = () =>
  useContext(BankTransactionsBulkSelectionContext)
