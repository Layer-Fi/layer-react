import { isStringArray } from '@utils/array/isStringArray'

export type CacheKeyInfo<TKey = unknown> = {
  tags: ReadonlyArray<string>
  key: TKey | string
}

export function withSWRKeyTags<TKey = unknown>(
  key: unknown,
  predicate: (info: CacheKeyInfo<TKey>) => boolean,
) {
  if (typeof key !== 'object' || key === null || !('tags' in key)) {
    return false
  }

  return isStringArray(key.tags)
    ? predicate({ tags: key.tags, key: key as TKey })
    : false
}
