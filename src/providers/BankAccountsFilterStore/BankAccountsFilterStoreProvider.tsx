import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'

type BankAccountsFilterStoreShape = {
  isActive: boolean
  selectedBankAccountIds: string[]
  actions: {
    toggleBankAccountId: (bankAccountId: string) => void
    retainBankAccountIds: (validBankAccountIds: string[]) => void
    clear: () => void
  }
}

const BankAccountsFilterStoreContext = createContext(
  createStore<BankAccountsFilterStoreShape>(() => ({
    isActive: false,
    selectedBankAccountIds: [],
    actions: {
      toggleBankAccountId: () => {},
      retainBankAccountIds: () => {},
      clear: () => {},
    },
  })),
)

export function useIsBankAccountFilterActive() {
  const store = useContext(BankAccountsFilterStoreContext)
  return useStore(store, state => state.isActive)
}

export function useSelectedBankAccountIds() {
  const store = useContext(BankAccountsFilterStoreContext)
  return useStore(store, state => state.selectedBankAccountIds)
}

export function useBankAccountFilterActions() {
  const store = useContext(BankAccountsFilterStoreContext)
  return useStore(store, state => state.actions)
}

export function BankAccountsFilterStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<BankAccountsFilterStoreShape>(set => ({
      isActive: true,
      selectedBankAccountIds: [],
      actions: {
        toggleBankAccountId: (bankAccountId: string) =>
          set(state => ({
            selectedBankAccountIds: state.selectedBankAccountIds.includes(bankAccountId)
              ? state.selectedBankAccountIds.filter(id => id !== bankAccountId)
              : [...state.selectedBankAccountIds, bankAccountId],
          })),
        retainBankAccountIds: (validBankAccountIds: string[]) =>
          set((state) => {
            const validIds = new Set(validBankAccountIds)
            const next = state.selectedBankAccountIds.filter(id => validIds.has(id))
            return next.length === state.selectedBankAccountIds.length
              ? state
              : { selectedBankAccountIds: next }
          }),
        clear: () => set(() => ({ selectedBankAccountIds: [] })),
      },
    })),
  )

  const { data: bankAccounts } = useListBankAccounts()
  useEffect(() => {
    if (!bankAccounts) return
    store.getState().actions.retainBankAccountIds(bankAccounts.map(account => account.id))
  }, [bankAccounts, store])

  return (
    <BankAccountsFilterStoreContext.Provider value={store}>
      {children}
    </BankAccountsFilterStoreContext.Provider>
  )
}
