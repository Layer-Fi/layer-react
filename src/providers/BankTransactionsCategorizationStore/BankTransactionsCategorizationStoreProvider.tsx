import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type TaxCodeComboboxOption = string

export type BankTransactionCategorization = {
  category: BankTransactionCategoryComboBoxOption | null
  taxCode: TaxCodeComboboxOption | null
}

export type BankTransactionsCategorizationState = {
  categorizations: Map<string, BankTransactionCategorization>
}

type BankTransactionsCategorizationActions = {
  setTransactionCategorization: (id: string, update: Partial<BankTransactionCategorization>) => void
  setOnlyNewTransactionCategorizations: (categorizations: Map<string, Partial<BankTransactionCategorization>>) => void
  clearTransactionCategorizations: (ids: string[]) => void
  clearAllTransactionCategorizations: () => void
}

type BankTransactionsCategorizationStore = BankTransactionsCategorizationState & {
  actions: BankTransactionsCategorizationActions
}

export const DEFAULT_CATEGORIZATION: BankTransactionCategorization = {
  category: null,
  taxCode: null,
}

const mergeCategorization = (
  current: BankTransactionCategorization,
  next: Partial<BankTransactionCategorization>,
): BankTransactionCategorization => ({
  category: next.category === undefined ? current.category : next.category,
  taxCode: next.taxCode === undefined ? current.taxCode : next.taxCode,
})

function buildStore() {
  return createStore<BankTransactionsCategorizationStore>((set) => {
    const setTransactionCategorization = (id: string, update: Partial<BankTransactionCategorization>) => {
      set(({ categorizations }) => {
        const newMap = new Map(categorizations)
        const current = categorizations.get(id) ?? DEFAULT_CATEGORIZATION
        const merged = mergeCategorization(current, update)
        const shouldWrite = !categorizations.has(id)
          || current.category !== merged.category
          || current.taxCode !== merged.taxCode

        if (!shouldWrite) return { categorizations }
        newMap.set(id, merged)
        return { categorizations: newMap }
      })
    }

    return {
      categorizations: new Map(),
      actions: {
        setTransactionCategorization,

        setOnlyNewTransactionCategorizations: (categorizations) => {
          set((state) => {
            const newMap = new Map(state.categorizations)
            let hasChanges = false

            categorizations.forEach((next, id) => {
              const isNewTransaction = !newMap.has(id)
              const current = newMap.get(id) ?? DEFAULT_CATEGORIZATION
              const merged = mergeCategorization(current, next)
              const shouldWrite = isNewTransaction
                || (current.category === null && merged.category !== null)
                || (current.taxCode === null && merged.taxCode !== null)

              if (shouldWrite) {
                newMap.set(id, merged)
                hasChanges = true
              }
            })

            return hasChanges ? { categorizations: newMap } : state
          })
        },

        clearTransactionCategorizations: (ids) => {
          set((state) => {
            const newMap = new Map(state.categorizations)
            ids.forEach(id => newMap.delete(id))
            return { categorizations: newMap }
          })
        },

        clearAllTransactionCategorizations: () => {
          set({ categorizations: new Map() })
        },
      },
    }
  })
}

const BankTransactionsCategorizationStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBankTransactionsCategorizationStore() {
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

export function useGetBankTransactionCategorizationByTransactionId(
  transactionId: string,
): { selectedCategorization: BankTransactionCategorization | undefined } {
  const store = useBankTransactionsCategorizationStore()
  const selectedCategorization = useStore(store, state => state.categorizations.get(transactionId))
  return { selectedCategorization }
}

export function useGetBankTransactionCategoryByTransactionId(
  transactionId: string,
): { selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined } {
  const store = useBankTransactionsCategorizationStore()
  const selectedCategory = useStore(store, state => state.categorizations.get(transactionId)?.category)
  return { selectedCategory }
}

export function useGetAllBankTransactionsCategorizations(): { categorizations: ReadonlyMap<string, BankTransactionCategorization> } {
  const store = useBankTransactionsCategorizationStore()
  const categorizations = useStore(store, state => state.categorizations)
  const categorizationsSnapshot = useMemo(() => new Map(categorizations), [categorizations])
  return { categorizations: categorizationsSnapshot }
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
