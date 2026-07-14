import { useCallback, useMemo } from 'react'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { filterVisibility } from '@utils/bankTransactions/shared'
import { useExitingItems } from '@hooks/utils/useExitingItems'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

/**
 * Drops review rows that were just categorized so the render layer can animate them
 * out, keeping each one mounted from its pre-categorization snapshot until its exit
 * animation completes — at which point the row is evicted from the cache. The row
 * stays counted/paginated during the fade but not after. Shared by the mobile,
 * tablet, and desktop transaction views.
 */
export function useBankTransactionsWithExit(transactions?: BankTransaction[]) {
  const { shouldHideAfterCategorize, removeFromCache } = useBankTransactionsContext()

  const reviewFiltered = useMemo(() => {
    if (!shouldHideAfterCategorize || !transactions) {
      return transactions
    }
    return transactions.filter(tx => filterVisibility(DisplayState.review, tx))
  }, [transactions, shouldHideAfterCategorize])

  const { displayItems, exitingIds, onExitComplete: onLocalExitComplete } = useExitingItems(reviewFiltered)

  const onExitComplete = useCallback((id: string) => {
    onLocalExitComplete(id)
    removeFromCache([id])
  }, [onLocalExitComplete, removeFromCache])

  return { displayItems, exitingIds, onExitComplete }
}
