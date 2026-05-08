import { useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getDefaultCategorizationForBankTransaction } from '@utils/bankTransactions/shared'
import {
  type BankTransactionCategorization,
  BankTransactionSelectionVariant,
  useGetBankTransactionCategorizationByTransactionId,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export const useGetBankTransactionCategorizationWithDefault = (bankTransaction: BankTransaction): BankTransactionCategorization => {
  const selectedCategorization = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)
  const defaultCategorization = useMemo(
    () => getDefaultCategorizationForBankTransaction(bankTransaction),
    [bankTransaction],
  )

  return selectedCategorization ?? defaultCategorization
}

export const useGetBankTransactionMatchOrCategoryWithDefault = (bankTransaction: BankTransaction): BankTransactionCategoryComboBoxOption | null => {
  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)

  if (selectedCategorization.variant === BankTransactionSelectionVariant.CATEGORY) {
    return selectedCategorization.category
  }

  return selectedCategorization.match
}
