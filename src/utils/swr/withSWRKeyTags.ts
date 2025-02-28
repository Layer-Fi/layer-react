import { isStringArray } from '../array/isStringArray'

export function withSWRKeyTags(key: unknown, predicate: (tags: ReadonlyArray<string>) => boolean) {
  if (typeof key !== 'object' || key === null || !('tags' in key)) {
    return false
  }

  return isStringArray(key.tags)
    ? predicate(key.tags)
    : false
}
