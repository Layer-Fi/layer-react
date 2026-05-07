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

  return selectedCategorization ?? getDefaultCategorizationForBankTransaction(bankTransaction)
}

export const useGetBankTransactionMatchOrCategoryWithDefault = (bankTransaction: BankTransaction): BankTransactionCategoryComboBoxOption | null => {
  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)

  if (selectedCategorization.variant === BankTransactionSelectionVariant.CATEGORY) {
    return selectedCategorization.category
  }

  return selectedCategorization.match
}
