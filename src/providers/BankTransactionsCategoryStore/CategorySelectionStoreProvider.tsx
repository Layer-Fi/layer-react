import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore, type StoreApi } from 'zustand'
import type { CategoryOption } from '../../types/categoryOption'

export type CategorySelectionState = {
  selectedCategories: Map<string, CategoryOption>
}

type CategorySelectionActions = {
  actions: {
    setSelection: (id: string, category: CategoryOption) => void
    clearSelection: (id: string) => void
    clearAllSelections: () => void
    getSelection: (id: string) => CategoryOption | undefined
    getAllSelections: () => Map<string, CategoryOption>
    setSelectionIfNotExists: (id: string, category: CategoryOption) => void
    bulkSetSelectionsIfNotExists: (selectedCategories: Array<{ id: string, category: CategoryOption }>) => void
  }
}

type CategorySelectionStore = CategorySelectionState & CategorySelectionActions

function buildStore() {
  return createStore<CategorySelectionStore>((set, get) => ({
    selectedCategories: new Map<string, CategoryOption>(),
    actions: {
      // User-initiated change - always update
      setSelection: (id: string, category: CategoryOption) =>
        set((state) => {
          const newMap = new Map(state.selectedCategories)
          newMap.set(id, category)
          return { selectedCategories: newMap }
        }),

      clearSelection: (id: string) =>
        set((state) => {
          const newMap = new Map(state.selectedCategories)
          newMap.delete(id)
          return { selectedCategories: newMap }
        }),

      clearAllSelections: () => set({ selectedCategories: new Map<string, CategoryOption>() }),

      getSelection: (id: string) => {
        return get().selectedCategories.get(id)
      },

      getAllSelections: () => {
        return new Map(get().selectedCategories)
      },

      // Only set if transaction ID doesn't already exist (for pagination/search)
      setSelectionIfNotExists: (id: string, category: CategoryOption) =>
        set((state) => {
          if (state.selectedCategories.has(id)) {
            return state // No change
          }
          const newMap = new Map(state.selectedCategories)
          newMap.set(id, category)
          return { selectedCategories: newMap }
        }),

      // Bulk operation for efficiency when loading new pages
      bulkSetSelectionsIfNotExists: (selectedCategories: Array<{ id: string, category: CategoryOption }>) =>
        set((state) => {
          const newMap = new Map(state.selectedCategories)
          let hasChanges = false

          selectedCategories.forEach(({ id, category }) => {
            if (!newMap.has(id)) {
              newMap.set(id, category)
              hasChanges = true
            }
          })

          return hasChanges ? { selectedCategories: newMap } : state
        }),
    },
  }))
}

type CategorySelectionStoreType = StoreApi<CategorySelectionStore>

const CategorySelectionStoreContext = createContext<CategorySelectionStoreType | null>(null)

function useCategorySelectionStore(): CategorySelectionStoreType {
  const store = useContext(CategorySelectionStoreContext)

  if (!store) {
    throw new Error('useCategorySelectionStore must be used within CategorySelectionStoreProvider')
  }

  return store
}

export function useCategorySelection(transactionId: string): { selectedCategory: CategoryOption | undefined } {
  const store = useCategorySelectionStore()

  const selectedCategory = useStore(store, state => state.selectedCategories.get(transactionId))

  return { selectedCategory }
}

export function useCategorySelectionActions(): CategorySelectionActions['actions'] {
  const store = useCategorySelectionStore()

  return useStore(store, state => state.actions)
}

export function useAllCategorySelections(): { selectedCategories: Map<string, CategoryOption> } {
  const store = useCategorySelectionStore()

  const selectedCategories = useStore(store, (state): Map<string, CategoryOption> => state.selectedCategories)

  return { selectedCategories }
}

type CategorySelectionStoreProviderProps = PropsWithChildren

export function CategorySelectionStoreProvider({
  children,
}: CategorySelectionStoreProviderProps) {
  const [store] = useState(() => buildStore())
  return (
    <CategorySelectionStoreContext.Provider value={store}>
      {children}
    </CategorySelectionStoreContext.Provider>
  )
}
