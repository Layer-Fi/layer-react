import { useState, createContext, useContext, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'

export enum BankTransactionsRoute {
  BankTransactionsTable = 'BankTransactionsTable',
  CategorizationRulesTable = 'CategorizationRulesTable',
}

type CategorizationRulesTableRouteState = { route: BankTransactionsRoute.CategorizationRulesTable }
type BankTransactionsTableRouteState = { route: BankTransactionsRoute.BankTransactionsTable }
type BankTransactionsRouteState = CategorizationRulesTableRouteState | BankTransactionsTableRouteState

type BankTransactionsRouteStoreShape = {
  routeState: BankTransactionsRouteState
  currentBankTransactionsPage: number
  currentCategorizationRulesPage: number
  navigate: {
    toBankTransactionsTable: () => void
    toCategorizationRulesTable: () => void
  }
  setCurrentBankTransactionsPage: (page: number) => void
  setCurrentCategorizationRulesPage: (page: number) => void
}

const BankTransactionsRouteStoreContext = createContext(
  createStore<BankTransactionsRouteStoreShape>(() => ({
    routeState: { route: BankTransactionsRoute.BankTransactionsTable },
    currentBankTransactionsPage: 1,
    currentCategorizationRulesPage: 1,
    navigate: {
      toBankTransactionsTable: () => {},
      toCategorizationRulesTable: () => {},
    },
    setCurrentBankTransactionsPage: () => {},
    setCurrentCategorizationRulesPage: () => {},
  })),
)

export function useBankTransactionsRouteState() {
  const store = useContext(BankTransactionsRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useBankTransactionsNavigation() {
  const store = useContext(BankTransactionsRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function useCurrentBankTransactionsPage() {
  const store = useContext(BankTransactionsRouteStoreContext)
  return useStore(store, state => state.currentBankTransactionsPage)
}

export function useCurrentCategorizationRulesPage() {
  const store = useContext(BankTransactionsRouteStoreContext)
  return useStore(store, state => state.currentCategorizationRulesPage)
}

export function useSetCurrentBankTransactionsPage() {
  const store = useContext(BankTransactionsRouteStoreContext)
  return useStore(store, state => state.setCurrentBankTransactionsPage)
}

export function useSetCurrentCategorizationRulesPage() {
  const store = useContext(BankTransactionsRouteStoreContext)
  return useStore(store, state => state.setCurrentCategorizationRulesPage)
}

export function BankTransactionsRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<BankTransactionsRouteStoreShape>(set => ({
      routeState: { route: BankTransactionsRoute.BankTransactionsTable },
      currentBankTransactionsPage: 1, // Bank transactions is one-indexed for some reason
      currentCategorizationRulesPage: 0,
      navigate: {
        toCategorizationRulesTable: () => {
          set(() => ({
            routeState: {
              route: BankTransactionsRoute.CategorizationRulesTable,
            },
          }))
        },
        toBankTransactionsTable: () => {
          set(() => ({
            routeState: {
              route: BankTransactionsRoute.BankTransactionsTable,
            },
          }))
        },
      },
      setCurrentBankTransactionsPage: (page: number) => {
        set({ currentBankTransactionsPage: page })
      },
      setCurrentCategorizationRulesPage: (page: number) => {
        set({ currentCategorizationRulesPage: page })
      },
    })),
  )

  return (
    <BankTransactionsRouteStoreContext.Provider value={store}>
      {props.children}
    </BankTransactionsRouteStoreContext.Provider>
  )
}
