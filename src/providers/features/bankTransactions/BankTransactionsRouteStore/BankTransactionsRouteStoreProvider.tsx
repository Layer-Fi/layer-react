import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

export enum BankTransactionsRoute {
  BankTransactionsTable = 'BankTransactionsTable',
  CategorizationRulesTable = 'CategorizationRulesTable',
}

type CategorizationRulesTableRouteState = { route: BankTransactionsRoute.CategorizationRulesTable }
type BankTransactionsTableRouteState = { route: BankTransactionsRoute.BankTransactionsTable }
type BankTransactionsRouteState = CategorizationRulesTableRouteState | BankTransactionsTableRouteState

export type CategorizationRulesTableFilters = {
  query: string
}

type BankTransactionsRouteStoreShape = {
  routeState: BankTransactionsRouteState
  currentBankTransactionsPage: number
  currentCategorizationRulesPage: number
  categorizationRulesTableFilters: CategorizationRulesTableFilters
  navigate: {
    toBankTransactionsTable: () => void
    toCategorizationRulesTable: () => void
  }
  actions: {
    setCurrentBankTransactionsPage: (pageIndex: number) => void
    setCurrentCategorizationRulesPage: (pageIndex: number) => void
    setCategorizationRulesTableFilters: (patchFilters: Partial<CategorizationRulesTableFilters>) => void
  }
}

const BankTransactionsRouteStoreContext = createContext(
  createStore<BankTransactionsRouteStoreShape>(() => ({
    routeState: { route: BankTransactionsRoute.BankTransactionsTable },
    currentBankTransactionsPage: 0,
    currentCategorizationRulesPage: 0,
    categorizationRulesTableFilters: { query: '' },
    navigate: {
      toBankTransactionsTable: () => {},
      toCategorizationRulesTable: () => {},
    },
    actions: {
      setCurrentBankTransactionsPage: () => {},
      setCurrentCategorizationRulesPage: () => {},
      setCategorizationRulesTableFilters: () => {},
    },
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
  const currentBankTransactionsPage = useStore(store, state => state.currentBankTransactionsPage)
  const setCurrentBankTransactionsPage = useStore(store, state => state.actions.setCurrentBankTransactionsPage)
  return useMemo(() => ({ currentBankTransactionsPage, setCurrentBankTransactionsPage }),
    [currentBankTransactionsPage, setCurrentBankTransactionsPage],
  )
}

export function useSetCurrentCategorizationRulesPage() {
  const store = useContext(BankTransactionsRouteStoreContext)
  const currentCategorizationRulesPage = useStore(store, state => state.currentCategorizationRulesPage)
  const setCurrentCategorizationRulesPage = useStore(store, state => state.actions.setCurrentCategorizationRulesPage)
  return useMemo(() => ({ currentCategorizationRulesPage, setCurrentCategorizationRulesPage }),
    [currentCategorizationRulesPage, setCurrentCategorizationRulesPage],
  )
}

export function useCategorizationRulesTableFilters() {
  const store = useContext(BankTransactionsRouteStoreContext)
  const tableFilters = useStore(store, state => state.categorizationRulesTableFilters)
  const setTableFilters = useStore(store, state => state.actions.setCategorizationRulesTableFilters)
  return useMemo(
    () => ({ tableFilters, setTableFilters, isFiltered: tableFilters.query.trim().length > 0 }),
    [tableFilters, setTableFilters],
  )
}

export function BankTransactionsRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<BankTransactionsRouteStoreShape>(set => ({
      routeState: { route: BankTransactionsRoute.BankTransactionsTable },
      currentBankTransactionsPage: 0,
      currentCategorizationRulesPage: 0,
      categorizationRulesTableFilters: { query: '' },
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
      actions: {
        setCurrentBankTransactionsPage: (pageIndex: number) => {
          set({ currentBankTransactionsPage: pageIndex })
        },
        setCurrentCategorizationRulesPage: (pageIndex: number) => {
          set({ currentCategorizationRulesPage: pageIndex })
        },
        setCategorizationRulesTableFilters: (patchFilters: Partial<CategorizationRulesTableFilters>) => {
          set(state => ({
            categorizationRulesTableFilters: { ...state.categorizationRulesTableFilters, ...patchFilters },
          }))
        },
      },
    })),
  )

  return (
    <BankTransactionsRouteStoreContext.Provider value={store}>
      {props.children}
    </BankTransactionsRouteStoreContext.Provider>
  )
}
