import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  useContext,
} from 'react'
import { type ExtractState, type StoreApi, useStore as useZustandStore } from 'zustand'

import { useConstant } from '@hooks/utils/react/useConstant'

type StoreSelector<TStore extends StoreApi<unknown>, TSelected> = (
  state: ExtractState<TStore>,
) => TSelected

type ScopedStore<TStore extends StoreApi<unknown>> = {
  Provider: ({ children }: PropsWithChildren) => ReactElement
  useStoreApi: () => TStore
  useSelector: <TSelected>(
    selector: StoreSelector<TStore, TSelected>,
  ) => TSelected
}

type CreateScopedStoreOptions<TStore extends StoreApi<unknown>> = {
  createStore: () => TStore
  storeName: string
}

export function createScopedStore<TStore extends StoreApi<unknown>>({
  createStore,
  storeName,
}: CreateScopedStoreOptions<TStore>): ScopedStore<TStore> {
  const StoreContext = createContext<TStore | null>(null)

  function useStoreApi() {
    const store = useContext(StoreContext)

    if (store === null) {
      throw new Error(`${storeName} hooks must be used within ${storeName}.Provider`)
    }

    return store
  }

  function useSelector<TSelected>(selector: StoreSelector<TStore, TSelected>) {
    return useZustandStore(useStoreApi(), selector)
  }

  function Provider({ children }: PropsWithChildren) {
    const store = useConstant(createStore)

    return (
      <StoreContext.Provider value={store}>
        {children}
      </StoreContext.Provider>
    )
  }

  return {
    Provider,
    useStoreApi,
    useSelector,
  }
}
