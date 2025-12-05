import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/useBankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/useBankTransactions/useMatchBankTransactionWithCacheUpdate'
import { buildCategorizeBankTransactionPayloadForSplit } from '@hooks/useBankTransactions/utils'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type SaveBankTransactionRowFn = (
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  bankTransaction: BankTransaction,
) => Promise<void> | void

export const useSaveBankTransactionRow = () => {
  const {
    categorize: categorizeBankTransaction,
    isMutating: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizeBankTransactionWithCacheUpdate()

  const {
    match: matchBankTransaction,
    isMutating: isMatching,
    isError: isErrorMatching,
  } = useMatchBankTransactionWithCacheUpdate()

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
    isProcessing: isCategorizing || isMatching,
    isError: isErrorCategorizing || isErrorMatching,
  }), [isCategorizing, isMatching, isErrorCategorizing, isErrorMatching, saveBankTransactionRow])
}
