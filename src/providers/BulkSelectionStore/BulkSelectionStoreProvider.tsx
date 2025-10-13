import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

export type BulkSelectionState = {
  selected: Set<string>
}

type BulkSelectionActions = {
  select: (id: string) => void
  deselect: (id: string) => void
  selectMultiple: (ids: string[]) => void
  deselectMultiple: (ids: string[]) => void
  clearSelection: () => void
}

type BulkSelectionStore = BulkSelectionState & BulkSelectionActions

function buildStore() {
  return createStore<BulkSelectionStore>(set => ({
    selected: new Set<string>(),

    select: (id: string) =>
      set(state => ({
        selected: new Set(state.selected).add(id),
      })),

    deselect: (id: string) =>
      set((state) => {
        const newSet = new Set(state.selected)
        newSet.delete(id)
        return { selected: newSet }
      }),

    selectMultiple: (ids: string[]) =>
      set((state) => {
        const newSet = new Set(state.selected)
        ids.forEach(id => newSet.add(id))
        return { selected: newSet }
      }),

    deselectMultiple: (ids: string[]) =>
      set((state) => {
        const newSet = new Set(state.selected)
        ids.forEach(id => newSet.delete(id))
        return { selected: newSet }
      }),

    clearSelection: () => set({ selected: new Set<string>() }),
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

export function useSelectedIds() {
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

  const select = useStore(store, state => state.select)
  const deselect = useStore(store, state => state.deselect)
  const selectMultiple = useStore(store, state => state.selectMultiple)
  const deselectMultiple = useStore(store, state => state.deselectMultiple)
  const clearSelection = useStore(store, state => state.clearSelection)

  return { select, deselect, selectMultiple, deselectMultiple, clearSelection }
}

export function useIdIsSelected() {
  const store = useBulkSelectionStore()

  const selected = useStore(store, state => state.selected)

  return (id: string) => selected.has(id)
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
