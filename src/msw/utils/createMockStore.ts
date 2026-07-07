type WithId = { id: string }

export type MockStore<TItem extends WithId> = {
  all: () => readonly TItem[]
  findById: (id: string) => TItem | undefined
  save: (item: TItem) => void
  patchById: (id: string, applyPatch: (item: TItem) => TItem) => TItem | undefined
}

const resetCallbacks: Array<() => void> = []

/** Restores every mock store to its seed data - called between tests. */
export const resetMockStores = () => {
  resetCallbacks.forEach(reset => reset())
}

/*
 * A tiny in-memory collection backing the default MSW handlers, so mutations
 * (create/update/delete) are reflected by subsequent list responses instead
 * of always serving the immutable generated fixtures. Test-supplied
 * `.mock(...)` overrides bypass the store entirely.
 */
export const createMockStore = <TItem extends WithId>(seed: () => readonly TItem[]): MockStore<TItem> => {
  let items: readonly TItem[] = [...seed()]

  resetCallbacks.push(() => {
    items = [...seed()]
  })

  const findById = (id: string) => items.find(item => item.id === id)

  const save = (item: TItem) => {
    items = findById(item.id)
      ? items.map(existing => existing.id === item.id ? item : existing)
      : [...items, item]
  }

  const patchById = (id: string, applyPatch: (item: TItem) => TItem) => {
    const existing = findById(id)
    if (!existing) return undefined

    const patched = applyPatch(existing)
    save(patched)

    return patched
  }

  return {
    all: () => items,
    findById,
    save,
    patchById,
  }
}
