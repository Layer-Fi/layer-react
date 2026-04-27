import { useMemo } from 'react'

import {
  useBankTransactionsCategorizationActions,
  useGetAllBankTransactionsCategorizations,
  useGetBankTransactionCategorization,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

type BankTransactionsCategoryActions = {
  setTransactionCategory: (id: string, category: BankTransactionCategoryComboBoxOption | null) => void
  setOnlyNewTransactionCategories: (transactionCategories: Array<{ id: string, category: BankTransactionCategoryComboBoxOption | null }>) => void
  clearTransactionCategory: (id: string) => void
  clearMultipleTransactionCategories: (ids: string[]) => void
  clearAllTransactionCategories: () => void
}

export function useBankTransactionsCategoryActions(): BankTransactionsCategoryActions {
  const {
    setTransactionCategorization,
    setOnlyNewTransactionCategorizations,
  } = useBankTransactionsCategorizationActions()
  const { categorizations } = useGetAllBankTransactionsCategorizations()

  return useMemo(() => ({
    setTransactionCategory: (id, category) => {
      setTransactionCategorization(id, { category })
    },
    setOnlyNewTransactionCategories: (transactionCategories) => {
      setOnlyNewTransactionCategorizations(new Map(
        transactionCategories.map(({ id, category }) => [id, { category, taxCode: null }]),
      ))
    },
    clearTransactionCategory: (id) => {
      setTransactionCategorization(id, { category: null })
    },
    clearMultipleTransactionCategories: (ids) => {
      ids.forEach((id) => {
        setTransactionCategorization(id, { category: null })
      })
    },
    clearAllTransactionCategories: () => {
      categorizations.forEach((_, id) => {
        setTransactionCategorization(id, { category: null })
      })
    },
  }), [
    categorizations,
    setOnlyNewTransactionCategorizations,
    setTransactionCategorization,
  ])
}

export function useGetBankTransactionCategory(transactionId: string): { selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined } {
  const { selectedCategorization } = useGetBankTransactionCategorization(transactionId)

  return {
    selectedCategory: selectedCategorization?.category,
  }
}

export function useGetAllBankTransactionsCategories(): { transactionCategories: Map<string, BankTransactionCategoryComboBoxOption | null> } {
  const { categorizations } = useGetAllBankTransactionsCategorizations()
  const transactionCategories = new Map<string, BankTransactionCategoryComboBoxOption | null>()

  categorizations.forEach((categorization, id) => {
    transactionCategories.set(id, categorization.category)
  })

  return {
    transactionCategories,
  }
}
