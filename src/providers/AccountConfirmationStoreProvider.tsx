import React, { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'

type AccountConfirmationStoreShape = {
  isDismissed: boolean
  actions: {
    dismiss: () => void
  }
}

const AccountConfirmationStoreContext = createContext(
  createStore<AccountConfirmationStoreShape>(() => ({
    isDismissed: false,
    actions: {
      dismiss: () => {},
    }
  }))
)

export function useAccountConfirmationStore() {
  const store = useContext(AccountConfirmationStoreContext)
  return useStore(store)
}

export function AccountConfirmationStoreProvider({
  children,
  initialIsDismissed = false,
}: PropsWithChildren<{ initialIsDismissed?: boolean }>) {
  const [store] = useState(() =>
    createStore<AccountConfirmationStoreShape>((set) => ({
      isDismissed: initialIsDismissed,
      actions: {
        dismiss: () => set((state) => ({ ...state, isDismissed: true })),
      }
    }))
  )

  return (
    <AccountConfirmationStoreContext.Provider value={store}>
      {children}
    </AccountConfirmationStoreContext.Provider>
  )
}
