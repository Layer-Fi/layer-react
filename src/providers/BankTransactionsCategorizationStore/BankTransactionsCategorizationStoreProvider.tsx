import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'

export type BankTransactionCategorization = {
  category: BankTransactionCategoryComboBoxOption | null
  taxCode: TaxCodeSelectOption | null
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

function buildStore() {
  return createStore<BankTransactionsCategorizationStore>(set => ({
    categorizations: new Map<string, BankTransactionCategorization>(),
    actions: {
      setTransactionCategorization: (id: string, categorization: BankTransactionCategorization): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          newMap.set(id, categorization)
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
              newMap.set(id, newCategorization)
              hasChanges = true
              return
            }

            const applyCategory = currCategorization.category === null && newCategorization.category !== null
            const applyTaxCode = currCategorization.taxCode === null && newCategorization.taxCode !== null

            if (applyCategory || applyTaxCode) {
              newMap.set(id, {
                category: applyCategory ? newCategorization.category : currCategorization.category,
                taxCode: applyTaxCode ? newCategorization.taxCode : currCategorization.taxCode,
              })
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

export function useGetBankTransactionCategorization(transactionId: string): { selectedCategorization: BankTransactionCategorization | null | undefined } {
  const store = useBankTransactionsCategorizationStore()

  const selectedCategorization = useStore(store, state => state.categorizations.get(transactionId))

  return { selectedCategorization }
}

export function useGetAllBankTransactionsCategorizations(): { categorizations: Map<string, BankTransactionCategorization | null> } {
  const store = useBankTransactionsCategorizationStore()

  const categorizations = useStore(store, state => state.categorizations)

  return { categorizations }
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
