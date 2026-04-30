import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { buildCategorizeBankTransactionPayloadForSplit } from '@utils/bankTransactions/shared'
import { getCategoryPayloadTaxCode } from '@utils/bankTransactions/taxCode'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useMatchBankTransactionWithCacheUpdate'
import { type BankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type SaveBankTransactionRowFn = (
  selectedCategorization: BankTransactionCategorization | undefined,
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
    selectedCategorization: BankTransactionCategorization | undefined,
    bankTransaction: BankTransaction,
  ) => {
    const selectedCategory = selectedCategorization?.category

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
      taxCode: getCategoryPayloadTaxCode(selectedCategory.classification, selectedCategorization?.taxCode?.value),
    })
  }, [categorizeBankTransaction, matchBankTransaction])

  return useMemo(() => ({
    saveBankTransactionRow,
    isProcessing: isCategorizing || isMatching,
    isError: isErrorCategorizing || isErrorMatching,
  }), [isCategorizing, isMatching, isErrorCategorizing, isErrorMatching, saveBankTransactionRow])
}
