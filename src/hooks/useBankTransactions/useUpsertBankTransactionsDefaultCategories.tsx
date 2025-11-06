import { useEffect } from 'react'
import { BankTransaction } from '@internal-types/bank_transactions'
import { getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'
import { useBankTransactionsCategoryActions } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'

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
