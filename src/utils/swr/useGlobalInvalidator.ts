import { useCallback } from 'react'
import { useSWRConfig, type Cache } from 'swr'
import { withSWRKeyTags } from './withSWRKeyTags'

type GetRelevantCacheKeysParameters = {
  cache: Cache<unknown>
  predicate: (tags: ReadonlyArray<string>) => boolean
}

function getRelevantCacheKeys({
  cache,
  predicate,
}: GetRelevantCacheKeysParameters) {
  return Array.from(cache.keys())
    .map((key) => {
      const data = cache.get(key)
      if (data && '_k' in data) {
        const { _k: rawKey } = data

        if (typeof rawKey === 'string' && rawKey.startsWith('$inf$')) {
          const regexMatch = rawKey.match(/tags:@(.+),,/)
          const capturedGroup = regexMatch?.[1]

          if (capturedGroup) {
            const tags = capturedGroup
              .split(',')
              .map(tag => tag.replaceAll('"', ''))

            return predicate(tags)
              ? key
              : undefined
          }
        }

        return withSWRKeyTags(rawKey, predicate)
          ? key
          : undefined
      }
    })
    .filter(key => key !== undefined)
}

export function useGlobalInvalidator() {
  const { mutate, cache } = useSWRConfig()

  const invalidate = useCallback(
    (
      predicate: (tags: ReadonlyArray<string>) => boolean,
    ) => Promise.all(
      getRelevantCacheKeys({ cache, predicate })
        .map(key => mutate(
          key,
          undefined,
          {
            revalidate: true,
            populateCache: false,
          },
        )),
    ),
    [
      cache,
      mutate,
    ],
  )

  return { invalidate }
}

export function useGlobalOptimisticUpdater() {
  const { mutate, cache } = useSWRConfig()

  const optimisticUpdate = useCallback(
    <unsafe_TData>(
      predicate: (tags: ReadonlyArray<string>) => boolean,
      optimisticUpdateCallback: (displayedData: unsafe_TData) => unsafe_TData,
    ) => Promise.all(
      getRelevantCacheKeys({ cache, predicate })
        .map(key => mutate(
          key,
          undefined,
          {
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
    ),
    [
      cache,
      mutate,
    ],
  )

  return { optimisticUpdate }
}
