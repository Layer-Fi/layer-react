export function asMutable<T>(a: readonly T[]): T[] {
  return a as unknown as T[]
}
