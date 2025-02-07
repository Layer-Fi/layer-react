export type ReadonlyArrayWithAtLeastOne<T> = readonly [T, ...T[]]

export function isArrayWithAtLeastOne<T>(
  list: ReadonlyArray<T>,
): list is ReadonlyArrayWithAtLeastOne<T> {
  return list.length > 0
}

export function getArrayWithAtLeastOneOrFallback<T>(
  list: ReadonlyArray<T>,
  fallback: ReadonlyArrayWithAtLeastOne<T>,
): ReadonlyArrayWithAtLeastOne<T> {
  if (list.length === 0) {
    return fallback
  }

  return list as ReadonlyArrayWithAtLeastOne<T>
}
