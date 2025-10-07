import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

export type BulkSelectionState<TId extends string = string> = {
  selectedIds: Set<TId>
}

type BulkSelectionActions<TId extends string = string> = {
  add: (id: TId) => void
  remove: (id: TId) => void
  addMultiple: (ids: TId[]) => void
  clear: () => void
  toggle: (id: TId) => void
}

type BulkSelectionStore<TId extends string = string> = BulkSelectionState<TId> & {
  actions: BulkSelectionActions<TId>
}

function buildStore<TId extends string = string>() {
  return createStore<BulkSelectionStore<TId>>(set => ({
    selectedIds: new Set<TId>(),

    actions: {
      add: (id: TId) =>
        set(state => ({
          selectedIds: new Set(state.selectedIds).add(id),
        })),

      remove: (id: TId) =>
        set((state) => {
          const newSet = new Set(state.selectedIds)
          newSet.delete(id)
          return { selectedIds: newSet }
        }),

      addMultiple: (ids: TId[]) =>
        set((state) => {
          const newSet = new Set(state.selectedIds)
          ids.forEach(id => newSet.add(id))
          return { selectedIds: newSet }
        }),

      clear: () => set({ selectedIds: new Set<TId>() }),

      toggle: (id: TId) =>
        set((state) => {
          const newSet = new Set(state.selectedIds)
          if (newSet.has(id)) {
            newSet.delete(id)
          }
          else {
            newSet.add(id)
          }
          return { selectedIds: newSet }
        }),
    },
  }))
}

const BulkSelectionStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBulkSelectionStore<TId extends string = string>() {
  const store = useContext(BulkSelectionStoreContext)
  if (!store) {
    throw new Error('useBulkSelectionStore must be used within BulkSelectionStoreProvider')
  }
  return store as unknown as ReturnType<typeof buildStore<TId>>
}

export function useBulkSelectionIds<TId extends string = string>() {
  const store = useBulkSelectionStore<TId>()

  const selectedIds = useStore(store, state => state.selectedIds)

  return { selectedIds }
}

export function useBulkSelectionCount() {
  const store = useBulkSelectionStore()

  const count = useStore(store, state => state.selectedIds.size)

  return { count }
}

export function useBulkSelectionActions<TId extends string = string>() {
  const store = useBulkSelectionStore<TId>()

  const add = useStore(store, state => state.actions.add)
  const remove = useStore(store, state => state.actions.remove)
  const addMultiple = useStore(store, state => state.actions.addMultiple)
  const clear = useStore(store, state => state.actions.clear)
  const toggle = useStore(store, state => state.actions.toggle)

  return { add, remove, addMultiple, clear, toggle }
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
