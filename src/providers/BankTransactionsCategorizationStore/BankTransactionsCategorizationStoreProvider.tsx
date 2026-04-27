import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type TaxCodeSelectOption = {
  label: string
  value: string
}

export type BankTransactionCategorization = {
  category: BankTransactionCategoryComboBoxOption | null
  taxCode: TaxCodeSelectOption | null
}

type BankTransactionCategorizationUpdate =
  | Pick<BankTransactionCategorization, 'category'>
  | Pick<BankTransactionCategorization, 'taxCode'>
  | BankTransactionCategorization

export type BankTransactionsCategorizationState = {
  categorizations: Map<string, BankTransactionCategorization>
}

type BankTransactionsCategorizationActions = {
  setTransactionCategorization: (
    id: string,
    categorization: BankTransactionCategorizationUpdate,
  ) => void
  setOnlyNewTransactionCategorizations: (
    categorizations: Map<string, BankTransactionCategorization>
  ) => void
  clearTransactionCategorizations: (ids: string[]) => void
  clearAllTransactionTaxCodes: () => void
  clearAllTransactionCategorizations: () => void
}

type BankTransactionsCategorizationStore = BankTransactionsCategorizationState & {
  actions: BankTransactionsCategorizationActions
}

function normalizeCategorization(
  currentCategorization: BankTransactionCategorization | undefined,
  nextCategorization: BankTransactionCategorizationUpdate,
): BankTransactionCategorization {
  const mergedCategorization: BankTransactionCategorization = currentCategorization
    ? { ...currentCategorization }
    : { category: null, taxCode: null }

  if ('category' in nextCategorization) {
    mergedCategorization.category = nextCategorization.category
  }

  if ('taxCode' in nextCategorization) {
    mergedCategorization.taxCode = nextCategorization.taxCode
  }

  return mergedCategorization
}

function buildStore() {
  return createStore<BankTransactionsCategorizationStore>(set => ({
    categorizations: new Map<string, BankTransactionCategorization>(),
    actions: {
      setTransactionCategorization: (id: string, categorization: BankTransactionCategorizationUpdate): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          const nextCategorization = normalizeCategorization(newMap.get(id), categorization)

          newMap.set(id, nextCategorization)

          return { categorizations: newMap }
        })
      },

      setOnlyNewTransactionCategorizations: (categorizations: Map<string, BankTransactionCategorization>): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          let hasChanges = false

          categorizations.forEach((newCategorization, id) => {
            const currCategorization = newMap.get(id)

            if (currCategorization === undefined) {
              newMap.set(id, normalizeCategorization(undefined, newCategorization))
              hasChanges = true
              return
            }

            const applyCategory = currCategorization.category === null && newCategorization.category !== null
            const applyTaxCode = currCategorization.taxCode === null && newCategorization.taxCode !== null

            if (applyCategory || applyTaxCode) {
              const nextCategorization = {
                category: applyCategory ? newCategorization.category : currCategorization.category,
                taxCode: applyTaxCode ? newCategorization.taxCode : currCategorization.taxCode,
              }

              newMap.set(id, nextCategorization)
              hasChanges = true
            }
          })

          return hasChanges ? { categorizations: newMap } : state
        })
      },

      clearTransactionCategorizations: (ids: string[]): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          ids.forEach(id => newMap.delete(id))
          return { categorizations: newMap }
        })
      },

      clearAllTransactionTaxCodes: () => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          newMap.forEach((categorization, id) => {
            newMap.set(id, { ...categorization, taxCode: null })
          })
          return { categorizations: newMap }
        })
      },

      clearAllTransactionCategorizations: () => {
        set({ categorizations: new Map<string, BankTransactionCategorization>() })
      },
    },
  }))
}

const BankTransactionsCategorizationStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBankTransactionsCategorizationStore(): ReturnType<typeof buildStore> {
  const store = useContext(BankTransactionsCategorizationStoreContext)

  if (!store) {
    throw new Error('useBankTransactionsCategorizationStore must be used within BankTransactionsCategorizationStoreProvider')
  }

  return store
}

export function useBankTransactionsCategorizationActions(): BankTransactionsCategorizationActions {
  const store = useBankTransactionsCategorizationStore()

  return useStore(store, state => state.actions)
}

export function useGetBankTransactionCategorization(transactionId: string): { selectedCategorization: BankTransactionCategorization | undefined } {
  const store = useBankTransactionsCategorizationStore()

  const selectedCategorization = useStore(store, state => state.categorizations.get(transactionId))

  return { selectedCategorization }
}

export function useGetAllBankTransactionsCategorizations(): { categorizations: Map<string, BankTransactionCategorization> } {
  const store = useBankTransactionsCategorizationStore()

  const categorizations = useStore(store, state => state.categorizations)

  return { categorizations }
}

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

type BankTransactionsTaxCodeActions = {
  setTransactionTaxCode: (id: string, taxCode: TaxCodeSelectOption | null) => void
  clearTransactionTaxCode: (id: string) => void
  clearMultipleTransactionTaxCodes: (ids: string[]) => void
  clearAllTransactionTaxCodes: () => void
}

export function useBankTransactionsTaxCodeActions(): BankTransactionsTaxCodeActions {
  const {
    setTransactionCategorization,
    clearAllTransactionTaxCodes,
  } = useBankTransactionsCategorizationActions()

  return useMemo(() => ({
    setTransactionTaxCode: (id, taxCode) => {
      setTransactionCategorization(id, { taxCode })
    },
    clearTransactionTaxCode: (id) => {
      setTransactionCategorization(id, { taxCode: null })
    },
    clearMultipleTransactionTaxCodes: (ids) => {
      ids.forEach((id) => {
        setTransactionCategorization(id, { taxCode: null })
      })
    },
    clearAllTransactionTaxCodes,
  }), [
    clearAllTransactionTaxCodes,
    setTransactionCategorization,
  ])
}

export function useGetBankTransactionTaxCode(transactionId: string): {
  selectedTaxCode: TaxCodeSelectOption | null
  hasSelectedTaxCode: boolean
} {
  const { selectedCategorization } = useGetBankTransactionCategorization(transactionId)

  return {
    selectedTaxCode: selectedCategorization?.taxCode ?? null,
    hasSelectedTaxCode: selectedCategorization !== undefined,
  }
}

export function useGetBankTransactionSessionTaxCodes(transactionId: string): {
  sessionTaxCodes: TaxCodeSelectOption[]
} {
  const { selectedTaxCode, hasSelectedTaxCode } = useGetBankTransactionTaxCode(transactionId)

  return {
    sessionTaxCodes: hasSelectedTaxCode && selectedTaxCode ? [selectedTaxCode] : [],
  }
}

type BankTransactionsCategorizationStoreProviderProps = PropsWithChildren

export function BankTransactionsCategorizationStoreProvider({
  children,
}: BankTransactionsCategorizationStoreProviderProps): JSX.Element {
  const [store] = useState(() => buildStore())
  return (
    <BankTransactionsCategorizationStoreContext.Provider value={store}>
      {children}
    </BankTransactionsCategorizationStoreContext.Provider>
  )
}
