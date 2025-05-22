import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from './withSWRKeyTags'

export function useGlobalInvalidator() {
  const { mutate, cache } = useSWRConfig()

  const invalidate = useCallback(
    <unsafe_TData>(
      predicate: (tags: ReadonlyArray<string>) => boolean,
      mutatorCallback?: (displayedData: unsafe_TData) => unsafe_TData,
    ) => Promise.all(
      Array.from(cache.keys())
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
        .map(key => mutate(
          key,
          mutatorCallback
            ? (currentData?: unsafe_TData) => {
              if (currentData) {
                return mutatorCallback(currentData)
              }
            }
            : undefined,
          {
            revalidate: true,
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
