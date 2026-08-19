/**
 * Picks from a pool by wrapping the index around its length. The modulo keeps the index in range,
 * which the compiler can't see, so an empty pool throws rather than handing back `undefined`.
 */
export function pickCyclic<T>(pool: ReadonlyArray<T>, index: number): T {
  if (pool.length === 0) {
    throw new Error('pickCyclic: cannot pick from an empty pool')
  }

  return pool[((index % pool.length) + pool.length) % pool.length] as T
}
