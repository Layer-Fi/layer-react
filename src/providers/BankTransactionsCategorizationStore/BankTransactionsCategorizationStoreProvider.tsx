import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'

export type BankTransactionCategorization = {
  category?: BankTransactionCategoryComboBoxOption | null
  taxCode?: TaxCodeSelectOption | null
}

export type BankTransactionsCategorizationState = {
  categorizations: Map<string, BankTransactionCategorization>
}

type BankTransactionsCategorizationActions = {
  actions: {
    setTransactionCategorization: (
      id: string,
      categorization: BankTransactionCategorization,
    ) => void
    setOnlyNewTransactionCategorizations: (
      categorizations: Map<string, BankTransactionCategorization>
    ) => void
    clearTransactionCategorizations: (ids: string[]) => void
    clearAllTransactionCategorizations: () => void
  }
}

type BankTransactionsCategorizationStore = BankTransactionsCategorizationState & BankTransactionsCategorizationActions

function hasCategory(
  categorization: BankTransactionCategorization | undefined,
): categorization is BankTransactionCategorization & { category: BankTransactionCategoryComboBoxOption | null } {
  return categorization !== undefined && 'category' in categorization
}

function hasTaxCode(
  categorization: BankTransactionCategorization | undefined,
): categorization is BankTransactionCategorization & { taxCode: TaxCodeSelectOption | null } {
  return categorization !== undefined && 'taxCode' in categorization
}

function normalizeCategorization(
  currentCategorization: BankTransactionCategorization | undefined,
  nextCategorization: BankTransactionCategorization,
): BankTransactionCategorization | undefined {
  const mergedCategorization: BankTransactionCategorization = { ...currentCategorization }

  if ('category' in nextCategorization) {
    if (nextCategorization.category === undefined) {
      delete mergedCategorization.category
    }

    else {
      mergedCategorization.category = nextCategorization.category
    }
  }

  if ('taxCode' in nextCategorization) {
    if (nextCategorization.taxCode === undefined) {
      delete mergedCategorization.taxCode
    }

    else {
      mergedCategorization.taxCode = nextCategorization.taxCode
    }
  }

  if (Object.keys(mergedCategorization).length === 0) {
    return undefined
  }

  return mergedCategorization
}

function buildStore() {
  return createStore<BankTransactionsCategorizationStore>(set => ({
    categorizations: new Map<string, BankTransactionCategorization>(),
    actions: {
      setTransactionCategorization: (id: string, categorization: BankTransactionCategorization): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          const nextCategorization = normalizeCategorization(newMap.get(id), categorization)

          if (nextCategorization === undefined) {
            newMap.delete(id)
          }

          else {
            newMap.set(id, nextCategorization)
          }

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
              const nextCategorization = normalizeCategorization(undefined, newCategorization)

              if (nextCategorization === undefined) {
                return
              }

              newMap.set(id, nextCategorization)
              hasChanges = true
              return
            }

            const applyCategory = hasCategory(newCategorization)
              && (
                !hasCategory(currCategorization)
                || (currCategorization.category === null && newCategorization.category !== null)
              )
            const applyTaxCode = hasTaxCode(newCategorization)
              && (
                !hasTaxCode(currCategorization)
                || (currCategorization.taxCode === null && newCategorization.taxCode !== null)
              )

            if (applyCategory || applyTaxCode) {
              const nextCategorization = normalizeCategorization(currCategorization, {
                ...(applyCategory ? { category: newCategorization.category } : {}),
                ...(applyTaxCode ? { taxCode: newCategorization.taxCode } : {}),
              })

              if (nextCategorization === undefined) {
                newMap.delete(id)
              }

              else {
                newMap.set(id, nextCategorization)
              }

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

export function useBankTransactionsCategorizationActions(): BankTransactionsCategorizationActions['actions'] {
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
    clearTransactionCategorizations,
    clearAllTransactionCategorizations,
  } = useBankTransactionsCategorizationActions()

  return useMemo(() => ({
    setTransactionCategory: (id, category) => {
      setTransactionCategorization(id, { category })
    },
    setOnlyNewTransactionCategories: (transactionCategories) => {
      setOnlyNewTransactionCategorizations(new Map(
        transactionCategories.map(({ id, category }) => [id, { category }]),
      ))
    },
    clearTransactionCategory: (id) => {
      clearTransactionCategorizations([id])
    },
    clearMultipleTransactionCategories: clearTransactionCategorizations,
    clearAllTransactionCategories: clearAllTransactionCategorizations,
  }), [
    clearTransactionCategorizations,
    clearAllTransactionCategorizations,
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
    if (hasCategory(categorization)) {
      transactionCategories.set(id, categorization.category)
    }
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
    clearAllTransactionCategorizations,
  } = useBankTransactionsCategorizationActions()

  return useMemo(() => ({
    setTransactionTaxCode: (id, taxCode) => {
      setTransactionCategorization(id, { taxCode })
    },
    clearTransactionTaxCode: (id) => {
      setTransactionCategorization(id, { taxCode: undefined })
    },
    clearMultipleTransactionTaxCodes: (ids) => {
      ids.forEach((id) => {
        setTransactionCategorization(id, { taxCode: undefined })
      })
    },
    clearAllTransactionTaxCodes: clearAllTransactionCategorizations,
  }), [
    clearAllTransactionCategorizations,
    setTransactionCategorization,
  ])
}

export function useGetBankTransactionTaxCode(transactionId: string): {
  selectedTaxCode: TaxCodeSelectOption | null | undefined
  hasSelectedTaxCode: boolean
} {
  const { selectedCategorization } = useGetBankTransactionCategorization(transactionId)

  return {
    selectedTaxCode: selectedCategorization?.taxCode,
    hasSelectedTaxCode: hasTaxCode(selectedCategorization),
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
