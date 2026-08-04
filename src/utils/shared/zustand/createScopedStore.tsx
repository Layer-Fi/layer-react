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

type ProviderProps<TStore extends StoreApi<unknown>> = PropsWithChildren<{
  /** Build the store instance for this mount. Called once (see `useConstant`). */
  createStore: () => TStore
}>

type ScopedStore<TStore extends StoreApi<unknown>> = {
  Provider: ({ children, createStore }: ProviderProps<TStore>) => ReactElement
  useStoreApi: () => TStore
  useSelector: <TSelected>(
    selector: StoreSelector<TStore, TSelected>,
  ) => TSelected
}

type CreateScopedStoreOptions = {
  storeName: string
}

export function createScopedStore<TStore extends StoreApi<unknown>>({
  storeName,
}: CreateScopedStoreOptions): ScopedStore<TStore> {
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

  function Provider({ children, createStore }: ProviderProps<TStore>) {
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
