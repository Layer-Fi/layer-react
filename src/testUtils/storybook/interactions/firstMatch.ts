/**
 * The first element a `getAllBy*` / `findAllBy*` query returned. Those queries already throw when
 * nothing matches, so this only carries that guarantee through the type.
 */
export function firstMatch<T>(elements: readonly T[]): T {
  const [first] = elements

  if (!first) {
    throw new Error('firstMatch: the query matched no elements')
  }

  return first
}
