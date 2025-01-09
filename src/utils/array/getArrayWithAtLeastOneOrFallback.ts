type ArrayWithAtLeastOne<T> = readonly [T, ...T[]]

export function getArrayWithAtLeastOneOrFallback<T>(
  list: ReadonlyArray<T>,
  fallback: ArrayWithAtLeastOne<T>,
): ArrayWithAtLeastOne<T> {
  if (list.length === 0) {
    return fallback
  }

  return list as ArrayWithAtLeastOne<T>
}
