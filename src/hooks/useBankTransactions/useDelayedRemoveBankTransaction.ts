import { useEffect, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bank_transactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

const DELAY_MS = 300

type UseDelayedRemoveBankTransactionParams = {
  bankTransaction: BankTransaction
  onRemove?: () => void
}

export function useDelayedRemoveBankTransaction({
  bankTransaction,
  onRemove,
}: UseDelayedRemoveBankTransactionParams) {
  const { shouldHideAfterCategorize, removeAfterCategorize } = useBankTransactionsContext()
  const isBeingRemoved = bankTransaction.recently_categorized && shouldHideAfterCategorize

  useEffect(() => {
    if (isBeingRemoved) {
      const timeout = setTimeout(() => {
        removeAfterCategorize([bankTransaction.id])
        onRemove?.()
      }, DELAY_MS)

      return () => clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankTransaction.recently_categorized])

  return useMemo(() => ({ isBeingRemoved }), [isBeingRemoved])
}
