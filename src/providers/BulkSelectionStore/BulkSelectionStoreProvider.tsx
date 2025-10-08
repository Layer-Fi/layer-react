import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

export type BulkSelectionState = {
  selected: Set<string>
}

type BulkSelectionActions = {
  select: (id: string) => void
  deselect: (id: string) => void
  selectMultiple: (ids: string[]) => void
  clearSelection: () => void
}

type BulkSelectionStore = BulkSelectionState & {
  actions: BulkSelectionActions
}

function buildStore() {
  return createStore<BulkSelectionStore>(set => ({
    selected: new Set<string>(),

    actions: {
      add: (id: string) =>
        set(state => ({
          selected: new Set(state.selected).add(id),
        })),

      remove: (id: string) =>
        set((state) => {
          const newSet = new Set(state.selected)
          newSet.delete(id)
          return { selected: newSet }
        }),

      addMultiple: (ids: string[]) =>
        set((state) => {
          const newSet = new Set(state.selected)
          ids.forEach(id => newSet.add(id))
          return { selected: newSet }
        }),

      clear: () => set({ selected: new Set<string>() }),
    },
  }))
}

const BulkSelectionStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBulkSelectionStore() {
  const store = useContext(BulkSelectionStoreContext)

  if (!store) {
    throw new Error('useBulkSelectionStore must be used within BulkSelectionStoreProvider')
  }

  return store
}

export function useBulkSelectionIds() {
  const store = useBulkSelectionStore()

  const selectedIds = useStore(store, state => state.selected)

  return { selectedIds }
}

export function useCountSelectedIds() {
  const store = useBulkSelectionStore()

  const count = useStore(store, state => state.selected.size)

  return { count }
}

export function useBulkSelectionActions() {
  const store = useBulkSelectionStore()

  const add = useStore(store, state => state.actions.add)
  const remove = useStore(store, state => state.actions.remove)
  const addMultiple = useStore(store, state => state.actions.addMultiple)
  const clear = useStore(store, state => state.actions.clear)

  return { add, remove, addMultiple, clear }
}

type BulkSelectionStoreProviderProps = PropsWithChildren

export function BulkSelectionStoreProvider({
  children,
}: BulkSelectionStoreProviderProps) {
  const [store] = useState(() => buildStore())
  return (
    <BulkSelectionStoreContext.Provider value={store}>
      {children}
    </BulkSelectionStoreContext.Provider>
  )
}
