import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getDefaultCategorizationForBankTransaction } from '@utils/features/bankTransactions/shared'
import { type BankTransactionCategorization, useBankTransactionsCategorizationActions } from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'

export const useUpsertBankTransactionsDefaultCategories = (bankTransactions: BankTransaction[] | undefined) => {
  const { setOnlyNewTransactionCategorizations } = useBankTransactionsCategorizationActions()
  useEffect(() => {
    if (!bankTransactions) return

    const defaultCategories = new Map<string, BankTransactionCategorization>(
      bankTransactions.map(transaction => [
        transaction.id,
        getDefaultCategorizationForBankTransaction(transaction),
      ]),
    )

    setOnlyNewTransactionCategorizations(defaultCategories)
  }, [bankTransactions, setOnlyNewTransactionCategorizations])
}
