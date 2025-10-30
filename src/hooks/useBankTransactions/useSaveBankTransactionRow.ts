import { BankTransaction } from '../../types/bank_transactions'
import { BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSuggestedMatchAsOption, isSplitAsOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { useCallback, useMemo } from 'react'
import { buildSplitCategorizationRequest } from '../../components/BankTransactionRow/utils'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'

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
      return matchBankTransaction(bankTransaction.id, selectedCategory.original.id)
    }

    if (isSplitAsOption(selectedCategory)) {
      const splitCategorizationRequest = buildSplitCategorizationRequest(selectedCategory)
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
