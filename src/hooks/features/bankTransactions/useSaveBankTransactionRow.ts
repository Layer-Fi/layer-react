import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { type BankTransactionCategoryComboBoxOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { buildCategorizeBankTransactionPayloadForSplit } from '@utils/features/bankTransactions/shared'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useMatchBankTransactionWithCacheUpdate'

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
