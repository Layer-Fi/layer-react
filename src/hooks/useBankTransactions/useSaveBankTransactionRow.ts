import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

import { buildCategorizeBankTransactionPayloadForSplit } from './utils'

type UseSaveBankTransactionRowResult = {
  saveBankTransactionRow: (selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined, bankTransaction: BankTransaction) => Promise<void>
}

export const useSaveBankTransactionRow = (): UseSaveBankTransactionRowResult => {
  const {
    categorize: categorizeBankTransaction,
    match: matchBankTransaction,
  } = useBankTransactionsContext()

  const saveBankTransactionRow = useCallback(async (
    selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
    bankTransaction: BankTransaction,
  ) => {
    if (!selectedCategory || isPlaceholderAsOption(selectedCategory)) {
      return
    }

    if (isSuggestedMatchAsOption(selectedCategory)) {
      return matchBankTransaction(
        bankTransaction.id,
        selectedCategory.original.id,
        selectedCategory.original.details.id,
      )
    }

    if (isSplitAsOption(selectedCategory)) {
      const splitCategorizationRequest = buildCategorizeBankTransactionPayloadForSplit(selectedCategory.original)
      return categorizeBankTransaction(bankTransaction.id, splitCategorizationRequest)
    }

    if (!selectedCategory.classificationEncoded) return

    return categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: selectedCategory.classificationEncoded,
    })
  }, [categorizeBankTransaction, matchBankTransaction])

  return useMemo(() => ({
    saveBankTransactionRow,
  }), [saveBankTransactionRow])
}
