import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type BankTransactionCategorization, useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'

export const useUpsertBankTransactionsDefaultCategories = (bankTransactions: BankTransaction[] | undefined) => {
  const { setOnlyNewTransactionCategorizations } = useBankTransactionsCategorizationActions()
  useEffect(() => {
    if (!bankTransactions) return

    const defaultCategories = new Map<string, Partial<BankTransactionCategorization>>(
      bankTransactions.map(transaction => [
        transaction.id,
        { category: getDefaultSelectedCategoryForBankTransaction(transaction) },
      ]),
    )

    setOnlyNewTransactionCategorizations(defaultCategories)
  }, [bankTransactions, setOnlyNewTransactionCategorizations])
}
