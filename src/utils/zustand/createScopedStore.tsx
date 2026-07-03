import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useRef,
} from 'react'
import { type StoreApi, useStore as useZustandStore } from 'zustand'

type ScopedStore<TState> = {
  Provider: ({ children }: PropsWithChildren) => ReactElement
  useStoreApi: () => StoreApi<TState>
  useSelector: <TSelected>(
    selector: (state: TState) => TSelected,
  ) => TSelected
}

type CreateScopedStoreOptions<TState> = {
  createStore: () => StoreApi<TState>
  storeName: string
}

function useConstant<T>(createValue: () => T) {
  const ref = useRef<T | null>(null)

  if (ref.current === null) {
    ref.current = createValue()
  }

  return ref.current
}

export function createScopedStore<TState>({
  createStore,
  storeName,
}: CreateScopedStoreOptions<TState>): ScopedStore<TState> {
  const StoreContext = createContext<StoreApi<TState> | null>(null)

  function useStoreApi() {
    const store = useContext(StoreContext)

    if (store === null) {
      throw new Error(`${storeName} hooks must be used within ${storeName}.Provider`)
    }

    return store
  }

  function useSelector<TSelected>(selector: (state: TState) => TSelected) {
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
