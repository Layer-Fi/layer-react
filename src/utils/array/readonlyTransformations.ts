export function mapReadonly<S, T>(
  array: ReadonlyArray<S>,
  callbackFn: (value: S, index: number, array: ReadonlyArray<S>) => T,
) {
  return array.map(callbackFn) as ReadonlyArray<T>
}

export function filterReadonly<T, S extends T>(
  array: ReadonlyArray<T>,
  predicate: (value: T, index: number, array: ReadonlyArray<T>) => value is S,
) {
  return array.filter(predicate) as ReadonlyArray<S>
}
