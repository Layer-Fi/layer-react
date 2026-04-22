import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'

export const useUpsertBankTransactionsDefaultCategories = (bankTransactions: BankTransaction[] | undefined) => {
  const { setOnlyNewTransactionCategorizations } = useBankTransactionsCategorizationActions()

  useEffect(() => {
    if (!bankTransactions) return

    setOnlyNewTransactionCategorizations(new Map(
      bankTransactions.map(transaction => [
        transaction.id,
        { category: getDefaultSelectedCategoryForBankTransaction(transaction) },
      ]),
    ))
  }, [bankTransactions, setOnlyNewTransactionCategorizations])
}
