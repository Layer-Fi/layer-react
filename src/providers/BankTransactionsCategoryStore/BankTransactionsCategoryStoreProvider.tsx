import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'
import type { BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/options'

export type BankTransactionsCategoryState = {
  transactionCategories: Map<string, BankTransactionCategoryComboBoxOption>
}

type BankTransactionsCategoryActions = {
  actions: {
    setTransactionCategory: (id: string, category: BankTransactionCategoryComboBoxOption) => void
    setOnlyNewTransactionCategories: (transactionCategories: Array<{ id: string, category: BankTransactionCategoryComboBoxOption }>) => void

    clearTransactionCategory: (id: string) => void
    clearMultipleTransactionCategories: (ids: string[]) => void
    clearAllTransactionCategories: () => void
  }
}

type BankTransactionsCategoryStore = BankTransactionsCategoryState & BankTransactionsCategoryActions

function buildStore() {
  return createStore<BankTransactionsCategoryStore>(set => ({
    transactionCategories: new Map<string, BankTransactionCategoryComboBoxOption>(),
    actions: {
      setTransactionCategory: (id: string, category: BankTransactionCategoryComboBoxOption): void => {
        set((state) => {
          const newMap = new Map(state.transactionCategories)
          newMap.set(id, category)
          return { transactionCategories: newMap }
        })
      },

      setOnlyNewTransactionCategories: (transactionCategories: Array<{ id: string, category: BankTransactionCategoryComboBoxOption }>): void => {
        set((state) => {
          const newMap = new Map(state.transactionCategories)
          let hasChanges = false

          transactionCategories.forEach(({ id, category }) => {
            if (!newMap.has(id)) {
              newMap.set(id, category)
              hasChanges = true
            }
          })
          return hasChanges ? { transactionCategories: newMap } : state
        })
      },

      clearTransactionCategory: (id: string): void => {
        set((state) => {
          const newMap = new Map(state.transactionCategories)
          newMap.delete(id)
          return { transactionCategories: newMap }
        })
      },

      clearMultipleTransactionCategories: (ids: string[]): void => {
        set((state) => {
          const newMap = new Map(state.transactionCategories)
          ids.forEach(id => newMap.delete(id))
          return { transactionCategories: newMap }
        })
      },

      clearAllTransactionCategories: () => {
        set({ transactionCategories: new Map<string, BankTransactionCategoryComboBoxOption>() })
      },

    },
  }))
}

const BankTransactionsCategoryStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBankTransactionsCategoryStore(): ReturnType<typeof buildStore> {
  const store = useContext(BankTransactionsCategoryStoreContext)

  if (!store) {
    throw new Error('useBankTransactionsCategoryStore must be used within BankTransactionsCategoryStoreProvider')
  }

  return store
}

export function useBankTransactionsCategoryActions(): BankTransactionsCategoryActions['actions'] {
  const store = useBankTransactionsCategoryStore()

  return useStore(store, state => state.actions)
}

export function useGetBankTransactionCategory(transactionId: string): { selectedCategory: BankTransactionCategoryComboBoxOption | undefined } {
  const store = useBankTransactionsCategoryStore()

  const selectedCategory = useStore(store, state => state.transactionCategories.get(transactionId))

  return { selectedCategory }
}

export function useGetAllBankTransactionsCategories(): { transactionCategories: Map<string, BankTransactionCategoryComboBoxOption> } {
  const store = useBankTransactionsCategoryStore()

  const transactionCategories = useStore(store, state => state.transactionCategories)

  return { transactionCategories }
}

type BankTransactionsCategoryStoreProviderProps = PropsWithChildren

export function BankTransactionsCategoryStoreProvider({
  children,
}: BankTransactionsCategoryStoreProviderProps): JSX.Element {
  const [store] = useState(() => buildStore())
  return (
    <BankTransactionsCategoryStoreContext.Provider value={store}>
      {children}
    </BankTransactionsCategoryStoreContext.Provider>
  )
}
