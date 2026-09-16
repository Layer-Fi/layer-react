export type FixtureOverrides<T> = Partial<T> | ((index: number) => Partial<T>)

/*
 * Fixture builders around one explicit base object: `make` returns the base with
 * optional overrides, `makeMany` returns n of them (overrides can vary by index).
 * The values are fixed and readable, so tests can assert on them directly.
 */
export function createFixtureFactory<T extends object>(base: T) {
  const make = (overrides?: Partial<T>): T => ({ ...base, ...overrides })

  const makeMany = (count: number, overrides?: FixtureOverrides<T>): T[] =>
    Array.from({ length: count }, (_, index) =>
      make(typeof overrides === 'function' ? overrides(index) : overrides),
    )

  return { make, makeMany }
}
