import { useCallback, useLayoutEffect, useMemo, useState } from 'react'

type WithId = { id: string }

type ExitingItemsState<T> = {
  items: T[]
  exitingIds: Set<string>
}

/**
 * Keeps a row mounted through its exit animation after it leaves `items`, rendered
 * from the snapshot it had on its last present render — so an optimistic edit that
 * removes it (e.g. categorizing a review row) animates out with its pre-edit
 * appearance instead of flashing its new state. The presentation layer owns the exit;
 * the data layer just drops the row. Call `onExitComplete(id)` when the animation ends.
 */
export function useExitingItems<T extends WithId>(items: readonly T[] | undefined) {
  const current = useMemo(() => items ?? [], [items])

  const [state, setState] = useState<ExitingItemsState<T>>(() => ({
    items: [...current],
    exitingIds: new Set(),
  }))

  useLayoutEffect(() => {
    const currentById = new Map(current.map(item => [item.id, item]))

    setState((prev) => {
      const items: T[] = []
      const exitingIds = new Set<string>()
      const seen = new Set<string>()

      for (const prevItem of prev.items) {
        const fresh = currentById.get(prevItem.id)
        if (fresh) {
          items.push(fresh)
        }
        else {
          items.push(prevItem)
          exitingIds.add(prevItem.id)
        }
        seen.add(prevItem.id)
      }

      for (const item of current) {
        if (!seen.has(item.id)) {
          items.push(item)
        }
      }

      const unchanged =
        items.length === prev.items.length
        && exitingIds.size === prev.exitingIds.size
        && items.every((item, index) => item === prev.items[index])

      return unchanged ? prev : { items, exitingIds }
    })
  }, [current])

  const onExitComplete = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.exitingIds.has(id)) {
        return prev
      }
      const exitingIds = new Set(prev.exitingIds)
      exitingIds.delete(id)
      return { items: prev.items.filter(item => item.id !== id), exitingIds }
    })
  }, [])

  return { displayItems: state.items, exitingIds: state.exitingIds, onExitComplete }
}
