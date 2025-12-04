import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/useBankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { buildCategorizeBankTransactionPayloadForSplit } from '@hooks/useBankTransactions/utils'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export const useSaveBankTransactionRow = () => {
  const { match: matchBankTransaction } = useBankTransactionsContext()

  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const saveBankTransactionRow = useCallback(async (
    selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
    bankTransaction: BankTransaction,
  ) => {
    if (!selectedCategory || isPlaceholderAsOption(selectedCategory)) {
      return
    }

    if (isSuggestedMatchAsOption(selectedCategory)) {
      return matchBankTransaction(bankTransaction, selectedCategory.original.id)
    }

    if (isSplitAsOption(selectedCategory)) {
      const splitCategorizationRequest = buildCategorizeBankTransactionPayloadForSplit(selectedCategory.original)
      return categorizeBankTransaction(bankTransaction.id, splitCategorizationRequest)
    }

    if (!selectedCategory.classification) return

    return categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: selectedCategory.classification,
    })
  }, [categorizeBankTransaction, matchBankTransaction])

  return useMemo(() => ({
    saveBankTransactionRow,
    isProcessing: isCategorizing,
    isError: isErrorCategorizing,
  }), [isCategorizing, isErrorCategorizing, saveBankTransactionRow])
}
