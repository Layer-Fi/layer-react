import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { buildCategorizeBankTransactionPayloadForSplit } from '@utils/bankTransactions/shared'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useMatchBankTransactionWithCacheUpdate'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

type SaveBankTransactionRowOptions = {
  onSuccess?: () => void
}

export type SaveBankTransactionRowFn = (
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  bankTransaction: BankTransaction,
  options?: SaveBankTransactionRowOptions,
) => Promise<void>

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

  const saveBankTransactionRow = useCallback<SaveBankTransactionRowFn>(async (
    selectedCategory,
    bankTransaction,
    options,
  ) => {
    if (!selectedCategory || isPlaceholderAsOption(selectedCategory)) {
      return
    }

    if (isSuggestedMatchAsOption(selectedCategory)) {
      return matchBankTransaction(bankTransaction, selectedCategory.original.id, options)
    }

    if (isSplitAsOption(selectedCategory)) {
      const splitCategorizationRequest = buildCategorizeBankTransactionPayloadForSplit(selectedCategory.original)
      return categorizeBankTransaction(bankTransaction.id, splitCategorizationRequest, options)
    }

    if (!selectedCategory.classification) return

    return categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: selectedCategory.classification,
    }, options)
  }, [categorizeBankTransaction, matchBankTransaction])

  return useMemo(() => ({
    saveBankTransactionRow,
    isProcessing: isCategorizing || isMatching,
    isError: isErrorCategorizing || isErrorMatching,
  }), [isCategorizing, isMatching, isErrorCategorizing, isErrorMatching, saveBankTransactionRow])
}
