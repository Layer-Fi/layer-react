import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { getCategoryPayloadTaxCode } from '@utils/bankTransactions/categorization'
import { buildCategorizeBankTransactionPayloadForSplit } from '@utils/bankTransactions/shared'
import { useCategorizeBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useCategorizeBankTransactionWithCacheUpdate'
import { useMatchBankTransactionWithCacheUpdate } from '@hooks/features/bankTransactions/useMatchBankTransactionWithCacheUpdate'
import { type CategorizedBankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type SaveBankTransactionRowOptions = {
  notify?: boolean
}

export type SaveBankTransactionRowFn = (
  selectedCategorization: CategorizedBankTransactionCategorization,
  bankTransaction: BankTransaction,
  options?: SaveBankTransactionRowOptions,
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

  const saveBankTransactionRow: SaveBankTransactionRowFn = useCallback(async (
    selectedCategorization,
    bankTransaction,
    options,
  ) => {
    const { category, taxCode } = selectedCategorization
    const notify = options?.notify

    if (isSuggestedMatchAsOption(category)) {
      return matchBankTransaction(bankTransaction, category.original.id)
    }

    if (isSplitAsOption(category)) {
      const splitCategorizationRequest = buildCategorizeBankTransactionPayloadForSplit(category.original)
      return categorizeBankTransaction(bankTransaction.id, splitCategorizationRequest, notify)
    }

    const classification = category.classification

    if (classification === null) {
      throw new Error('Selected bank transaction category cannot be submitted')
    }

    return categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: classification,
      taxCode: getCategoryPayloadTaxCode(classification, taxCode?.value),
    }, notify)
  }, [categorizeBankTransaction, matchBankTransaction])

  return useMemo(() => ({
    saveBankTransactionRow,
    isProcessing: isCategorizing || isMatching,
    isError: isErrorCategorizing || isErrorMatching,
  }), [isCategorizing, isMatching, isErrorCategorizing, isErrorMatching, saveBankTransactionRow])
}
