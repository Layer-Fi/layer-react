import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

type ChartOfAccountsSelectionStoreShape = {
  selectedAccountId?: string
  selectedEntryId?: string
  actions: {
    selectAccount: (accountId: string) => void
    clearSelection: () => void
    selectEntry: (entryId: string) => void
    closeSelectedEntry: () => void
  }
}

const ChartOfAccountsSelectionStoreContext = createContext(
  createStore<ChartOfAccountsSelectionStoreShape>(() => ({
    selectedAccountId: undefined,
    selectedEntryId: undefined,
    actions: {
      selectAccount: () => {},
      clearSelection: () => {},
      selectEntry: () => {},
      closeSelectedEntry: () => {},
    },
  })),
)

export function useSelectedLedgerAccountId() {
  const store = useContext(ChartOfAccountsSelectionStoreContext)
  return useStore(store, state => state.selectedAccountId)
}

export function useSelectedLedgerEntryId() {
  const store = useContext(ChartOfAccountsSelectionStoreContext)
  return useStore(store, state => state.selectedEntryId)
}

export function useChartOfAccountsSelectionActions() {
  const store = useContext(ChartOfAccountsSelectionStoreContext)
  return useStore(store, state => state.actions)
}

export function ChartOfAccountsSelectionStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<ChartOfAccountsSelectionStoreShape>(set => ({
      selectedAccountId: undefined,
      selectedEntryId: undefined,
      actions: {
        selectAccount: (accountId: string) => {
          set({ selectedAccountId: accountId })
        },
        clearSelection: () => {
          set({ selectedAccountId: undefined, selectedEntryId: undefined })
        },
        selectEntry: (entryId: string) => {
          set({ selectedEntryId: entryId })
        },
        closeSelectedEntry: () => {
          set({ selectedEntryId: undefined })
        },
      },
    })),
  )

  return (
    <ChartOfAccountsSelectionStoreContext.Provider value={store}>
      {props.children}
    </ChartOfAccountsSelectionStoreContext.Provider>
  )
}
