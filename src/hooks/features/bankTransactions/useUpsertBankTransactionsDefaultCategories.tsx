import { useEffect } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import {
  getDefaultSelectedCategoryForBankTransaction,
  getDefaultSuggestedMatchForBankTransaction,
  getVariantForBankTransaction,
} from '@utils/bankTransactions/shared'
import { getDefaultTaxCodeOptionForBankTransaction } from '@utils/bankTransactions/taxCode'
import { type BankTransactionCategorization, useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'

const getDefaultCategorizationForBankTransaction = (bankTransaction: BankTransaction) => {
  return {
    category: getDefaultSelectedCategoryForBankTransaction(bankTransaction),
    taxCode: getDefaultTaxCodeOptionForBankTransaction(bankTransaction),
    match: getDefaultSuggestedMatchForBankTransaction(bankTransaction),
    variant: getVariantForBankTransaction(bankTransaction),
  }
}

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
