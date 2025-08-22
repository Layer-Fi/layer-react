import { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'

type PlaidLinkErrorStoreShape = {
  isPlaidLinkError: boolean
  actions: {
    dismiss: () => void
    record: () => void
  }
}

const PlaidLinkErrorStoreContext = createContext(
  createStore<PlaidLinkErrorStoreShape>(() => ({
    isPlaidLinkError: false,
    actions: {
      dismiss: () => {},
      record: () => {},
    },
  })),
)

export function usePlaidLinkErrorStore() {
  const store = useContext(PlaidLinkErrorStoreContext)
  return useStore(store)
}

export function usePlaidLinkErrorStoreActions() {
  const store = useContext(PlaidLinkErrorStoreContext)

  const dismiss = useStore(store, ({ actions: { dismiss } }) => dismiss)
  const record = useStore(store, ({ actions: { record } }) => record)

  return { dismiss, record }
}

export function PlaidLinkErrorStoreProvider({
  children,
}: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<PlaidLinkErrorStoreShape>(set => ({
      isPlaidLinkError: false,
      actions: {
        dismiss: () => set(state => ({ ...state, isPlaidLinkError: false })),
        record: () => set(state => ({ ...state, isPlaidLinkError: true })),
      },
    })),
  )

  return (
    <PlaidLinkErrorStoreContext.Provider value={store}>
      {children}
    </PlaidLinkErrorStoreContext.Provider>
  )
}
