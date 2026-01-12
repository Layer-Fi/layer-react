import { useCallback, useMemo } from 'react'
import { useSWRConfig } from 'swr'

import { getRelevantCacheKeys } from '@utils/swr/getRelevantCacheKeys'
import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'

type CacheKeyPredicateFn<TKey = unknown> = (info: CacheKeyInfo<TKey>) => boolean

export function useGlobalCacheActions() {
  const { mutate, cache } = useSWRConfig()

  const invalidate = useCallback(<TKey = unknown>(
    predicate: CacheKeyPredicateFn<TKey>,
    { withPrecedingOptimisticUpdate }: { withPrecedingOptimisticUpdate?: boolean } = {},
  ) =>
    Promise.all(
      getRelevantCacheKeys<TKey>({ cache, predicate, withPrecedingOptimisticUpdate })
        .map(key => mutate(key, undefined, { revalidate: true, populateCache: false })),
    ), [cache, mutate])

  const patchCache = useCallback(
    <unsafe_TData, TKey = unknown>(
      predicate: CacheKeyPredicateFn<TKey>,
      transformData: (currentData?: unsafe_TData) => unsafe_TData,
      { withRevalidate }: { withRevalidate: boolean } = { withRevalidate: true },
    ) => {
      return Promise.all(
        getRelevantCacheKeys<TKey>({ cache, predicate })
          .map(key => mutate(key, transformData, { populateCache: true, revalidate: withRevalidate })),
      )
    },
    [cache, mutate],
  )

  const optimisticUpdate = useCallback(
    <unsafe_TData, TKey = unknown>(
      predicate: CacheKeyPredicateFn<TKey>,
      optimisticUpdateCallback: (displayedData: unsafe_TData) => unsafe_TData,
    ) =>
      Promise.all(getRelevantCacheKeys<TKey>({ cache, predicate })
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
    <TKey = unknown>(predicate: CacheKeyPredicateFn<TKey>) =>
      Promise.all(
        getRelevantCacheKeys<TKey>({ cache, predicate }).map(key =>
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
