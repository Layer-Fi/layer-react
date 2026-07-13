import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'

type BankAccountsFilterStoreShape = {
  isEnabled: boolean
  isLocked: boolean
  selectedBankAccountIds: string[]
  actions: {
    setSelectedBankAccountIds: (bankAccountIds: string[]) => void
    retainBankAccountIds: (validBankAccountIds: string[]) => void
    setLocked: (isLocked: boolean) => void
  }
}

const BankAccountsFilterStoreContext = createContext(
  createStore<BankAccountsFilterStoreShape>(() => ({
    isEnabled: false,
    isLocked: false,
    selectedBankAccountIds: [],
    actions: {
      setSelectedBankAccountIds: () => {},
      retainBankAccountIds: () => {},
      setLocked: () => {},
    },
  })),
)

export function useIsBankAccountFilterEnabled() {
  const store = useContext(BankAccountsFilterStoreContext)
  return useStore(store, state => state.isEnabled)
}

export function useIsBankAccountFilterLocked() {
  const store = useContext(BankAccountsFilterStoreContext)
  return useStore(store, state => state.isLocked)
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
      isEnabled: true,
      isLocked: false,
      selectedBankAccountIds: [],
      actions: {
        setSelectedBankAccountIds: (bankAccountIds: string[]) =>
          set(() => ({ selectedBankAccountIds: bankAccountIds })),
        setLocked: (isLocked: boolean) => set(() => ({ isLocked })),
        retainBankAccountIds: (validBankAccountIds: string[]) =>
          set((state) => {
            const validIds = new Set(validBankAccountIds)
            const next = state.selectedBankAccountIds.filter(id => validIds.has(id))
            return next.length === state.selectedBankAccountIds.length
              ? state
              : { selectedBankAccountIds: next }
          }),
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
