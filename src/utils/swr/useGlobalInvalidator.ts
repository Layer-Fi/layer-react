import { useCallback } from 'react'
import { useSWRConfig, type Cache } from 'swr'
import { withSWRKeyTags } from './withSWRKeyTags'

type GetRelevantCacheKeysParameters = {
  cache: Cache<unknown>
  predicate: (tags: ReadonlyArray<string>) => boolean
  withPrecedingOptimisticUpdate?: boolean
}

function getRelevantCacheKeys({
  cache,
  predicate,
  withPrecedingOptimisticUpdate,
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

            const isMatch = predicate(tags)

            if (isMatch) {
              if ('_i' in data && !withPrecedingOptimisticUpdate) {
                /*
                 * This is an intentional, but nasty side-effect.
                 *
                 * We are diving into the deep internals of SWR to indicate that every page in the infinite query
                 * should be fetched in the next revalidation cycle.
                 *
                 * @see {https://github.com/vercel/swr/blob/4e7e8ab6b1cce017d70b39b89becabaab3d2626a/src/infinite/index.ts#L175}
                 */
                data._i = true
              }

              return key
            }

            return undefined
          }
        }

        return withSWRKeyTags(rawKey, predicate)
          ? key
          : undefined
      }
    })
    .filter(key => key !== undefined)
}

type GlobalInvalidateOptions = {
  withPrecedingOptimisticUpdate?: boolean
}

export function useGlobalInvalidator() {
  const { mutate, cache } = useSWRConfig()

  const invalidate = useCallback(
    (
      predicate: (tags: ReadonlyArray<string>) => boolean,
      { withPrecedingOptimisticUpdate }: GlobalInvalidateOptions = {},
    ) => Promise.all(
      getRelevantCacheKeys({
        cache,
        predicate,
        withPrecedingOptimisticUpdate,
      })
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
