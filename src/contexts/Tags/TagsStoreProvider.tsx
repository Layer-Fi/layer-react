import React, {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'
import { createStore, useStore } from 'zustand'

type TagsStoreState = {
  activeKey?: string
  activeCategory?: string
  actions: {
    setActiveCategory: (context: { activeCategory?: string }) => void
  }
}

const TagsStoreContext = createContext(
  createStore<TagsStoreState>(() => ({
    /*
     * It would be even better to log warnings when these are accessed
     */
    activeKey: undefined,
    activeCategory: undefined,
    actions: {
      setActiveCategory: () => {},
    },
  })),
)

export function useTagsStore() {
  const store = useContext(TagsStoreContext)
  return useStore(store)
}

export function TagsStoreProvider({
  children,
  initialActiveKey,
  initialActiveCategory,
}: PropsWithChildren<{
  initialActiveKey?: string
  initialActiveCategory?: string
}>) {
  const [store] = useState(() =>
    createStore<TagsStoreState>(set => ({
      activeKey: initialActiveKey,
      activeCategory: initialActiveCategory,
      actions: {
        setActiveCategory: ({ activeCategory }) => set({ activeCategory }),
      },
    })),
  )

  return (
    <TagsStoreContext.Provider value={store}>
      {children}
    </TagsStoreContext.Provider>
  )
}
