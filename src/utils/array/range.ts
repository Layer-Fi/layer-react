export function range(start: number, end: number): ReadonlyArray<number> {
  return Array.from({ length: end - start }, (_, index) => start + index)
}
