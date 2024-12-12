import React, { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'

const ACCOUNT_CONFIRMATION_VISIBILITY = [
  'PRELOADED',
  'DEFAULT',
  'DISMISSED',
] as const
type AccountConfirmationVisibility = typeof ACCOUNT_CONFIRMATION_VISIBILITY[number]

type AccountConfirmationStoreShape = {
  visibility: AccountConfirmationVisibility
  actions: {
    dismiss: () => void
    preload: () => void
    reset: () => void
  }
}

const AccountConfirmationStoreContext = createContext(
  createStore<AccountConfirmationStoreShape>(() => ({
    visibility: 'DEFAULT',
    actions: {
      dismiss: () => {},
      preload: () => {},
      reset: () => {},
    },
  })),
)

export function useAccountConfirmationStore() {
  const store = useContext(AccountConfirmationStoreContext)
  return useStore(store)
}

export function useAccountConfirmationStoreActions() {
  const store = useContext(AccountConfirmationStoreContext)

  const preload = useStore(store, ({ actions: { preload } }) => preload)
  const dismiss = useStore(store, ({ actions: { dismiss } }) => dismiss)
  const reset = useStore(store, ({ actions: { reset } }) => reset)

  return { dismiss, preload, reset }
}

type AccountConfirmationStoreProviderProps = PropsWithChildren<{
  initialVisibility?: AccountConfirmationVisibility
}>

export function AccountConfirmationStoreProvider({
  children,
  initialVisibility = 'DEFAULT',
}: AccountConfirmationStoreProviderProps) {
  const [store] = useState(() =>
    createStore<AccountConfirmationStoreShape>(set => ({
      visibility: initialVisibility,
      actions: {
        dismiss: () => set(state => ({ ...state, visibility: 'DISMISSED' })),
        preload: () => set(state => ({ ...state, visibility: 'PRELOADED' })),
        reset: () => set(state => ({ ...state, visibility: 'DEFAULT' })),
      },
    })),
  )

  return (
    <AccountConfirmationStoreContext.Provider value={store}>
      {children}
    </AccountConfirmationStoreContext.Provider>
  )
}
