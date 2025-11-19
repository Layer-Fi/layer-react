import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useBankTransactionsCategoryActions } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'

export const useUpsertBankTransactionsDefaultCategories = (bankTransactions: BankTransaction[] | undefined) => {
  const { setOnlyNewTransactionCategories } = useBankTransactionsCategoryActions()
  useEffect(() => {
    if (!bankTransactions) return

    const defaultCategories = bankTransactions.map(transaction => ({
      id: transaction.id,
      category: getDefaultSelectedCategoryForBankTransaction(transaction),
    }))

    setOnlyNewTransactionCategories(defaultCategories)
  }, [bankTransactions, setOnlyNewTransactionCategories])
}
