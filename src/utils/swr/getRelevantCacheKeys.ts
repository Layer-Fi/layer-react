import { type Cache } from 'swr'

import { type CacheKeyInfo, withSWRKeyTags } from '@utils/swr/withSWRKeyTags'

type GetRelevantCacheKeysParameters<TKey = unknown> = {
  cache: Cache<unknown>
  predicate: (info: CacheKeyInfo<TKey>) => boolean
  withPrecedingOptimisticUpdate?: boolean
}

export function getRelevantCacheKeys<TKey = unknown>({
  cache,
  predicate,
  withPrecedingOptimisticUpdate,
}: GetRelevantCacheKeysParameters<TKey>) {
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

            const isMatch = predicate({ tags, key: rawKey })

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

        const isMatch = withSWRKeyTags<TKey>(rawKey, predicate)

        return isMatch ? key : undefined
      }
    })
    .filter(key => key !== undefined)
}
