import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

type BankAccountsFilterStoreShape = {
  isActive: boolean
  selectedBankAccountIds: string[]
  actions: {
    toggleBankAccountId: (bankAccountId: string) => void
    clear: () => void
  }
}

const BankAccountsFilterStoreContext = createContext(
  createStore<BankAccountsFilterStoreShape>(() => ({
    isActive: false,
    selectedBankAccountIds: [],
    actions: {
      toggleBankAccountId: () => {},
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
        clear: () => set(() => ({ selectedBankAccountIds: [] })),
      },
    })),
  )

  return (
    <BankAccountsFilterStoreContext.Provider value={store}>
      {children}
    </BankAccountsFilterStoreContext.Provider>
  )
}
