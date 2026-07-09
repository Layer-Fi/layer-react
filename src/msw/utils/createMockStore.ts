type WithId = { id: string }

export type MockStore<TItem> = {
  all: () => readonly TItem[]
  findById: (id: string) => TItem | undefined
  save: (item: TItem) => void
  patchById: (id: string, applyPatch: (item: TItem) => TItem) => TItem | undefined
  deleteById: (id: string) => void
}

type CreateMockStoreOptions<TItem> = {
  /** Defaults to `item => item.id` - override for domains keyed by a differently-named id field. */
  getId?: (item: TItem) => string
}

const resetCallbacks: Array<() => void> = []

/** Restores every mock store to its seed data - called between tests. */
export const resetMockStores = () => {
  resetCallbacks.forEach(reset => reset())
}

export function createMockStore<TItem extends WithId>(seed: () => readonly TItem[]): MockStore<TItem>
export function createMockStore<TItem>(
  seed: () => readonly TItem[],
  options: CreateMockStoreOptions<TItem> & { getId: (item: TItem) => string },
): MockStore<TItem>
export function createMockStore<TItem>(
  seed: () => readonly TItem[],
  { getId = (item: TItem) => (item as WithId).id }: CreateMockStoreOptions<TItem> = {},
): MockStore<TItem> {
  let items: readonly TItem[] = [...seed()]

  resetCallbacks.push(() => {
    items = [...seed()]
  })

  const findById = (id: string) => items.find(item => getId(item) === id)

  const save = (item: TItem) => {
    const id = getId(item)
    items = findById(id)
      ? items.map(existing => getId(existing) === id ? item : existing)
      : [...items, item]
  }

  const patchById = (id: string, applyPatch: (item: TItem) => TItem) => {
    const existing = findById(id)
    if (!existing) return undefined

    const patched = applyPatch(existing)
    save(patched)

    return patched
  }

  const deleteById = (id: string) => {
    items = items.filter(item => getId(item) !== id)
  }

  return {
    all: () => items,
    findById,
    save,
    patchById,
    deleteById,
  }
}
