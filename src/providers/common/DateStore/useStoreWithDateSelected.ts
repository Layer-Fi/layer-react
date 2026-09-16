import type { StoreApi } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>
type ExtractState<S> = S extends { getState: () => infer T } ? T : never

export function useStoreWithDateSelected<S extends ReadonlyStoreApi<unknown>>(
  api: S,
  selector: (state: ExtractState<S>) => Date,
) {
  return useStoreWithEqualityFn(api, selector, (a, b) => a.getTime() === b.getTime())
}
