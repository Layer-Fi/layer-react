import { useCallback, useMemo } from 'react'
import { useSWRConfig } from 'swr'

import { getRelevantCacheKeys } from '@utils/swr/getRelevantCacheKeys'

type PredicateFn = (tags: ReadonlyArray<string>) => boolean

export function useGlobalCacheActions() {
  const { mutate, cache } = useSWRConfig()

  const invalidate = useCallback((
    predicate: PredicateFn,
    { withPrecedingOptimisticUpdate }: { withPrecedingOptimisticUpdate?: boolean } = {},
  ) =>
    Promise.all(
      getRelevantCacheKeys({ cache, predicate, withPrecedingOptimisticUpdate })
        .map(key => mutate(key, undefined, { revalidate: true, populateCache: false })),
    ), [cache, mutate])

  const patchCache = useCallback(
    <unsafe_TData>(
      predicate: PredicateFn,
      transformData: (currentData?: unsafe_TData) => unsafe_TData,
      { withRevalidate }: { withRevalidate: boolean } = { withRevalidate: true },
    ) => {
      return Promise.all(
        getRelevantCacheKeys({ cache, predicate })
          .map(key => mutate(key, transformData, { populateCache: true, revalidate: withRevalidate })),
      )
    },
    [cache, mutate],
  )

  const optimisticUpdate = useCallback(
    <unsafe_TData>(
      predicate: PredicateFn,
      optimisticUpdateCallback: (displayedData: unsafe_TData) => unsafe_TData,
    ) =>
      Promise.all(getRelevantCacheKeys({ cache, predicate })
        .map(key => mutate(key, undefined, {
          optimisticData: (_currentData: unknown, displayedData?: unsafe_TData) => {
            if (displayedData) {
              return optimisticUpdateCallback(displayedData)
            }

            return displayedData
          },
          populateCache: false,
          revalidate: false,
        },
        )),
      ), [cache, mutate],
  )

  const forceReload = useCallback(
    (predicate: PredicateFn) =>
      Promise.all(
        getRelevantCacheKeys({ cache, predicate }).map(key =>
          mutate(key, undefined, { populateCache: true, revalidate: true }),
        ),
      ),
    [cache, mutate],
  )

  return useMemo(() => ({
    invalidate,
    patchCache,
    optimisticUpdate,
    forceReload,
  }), [invalidate, patchCache, optimisticUpdate, forceReload])
}
