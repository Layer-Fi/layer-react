import { useCallback, useMemo } from 'react'
import { type Selection } from 'react-aria-components/GridList'

import { useBulkSelectionActions, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'

type MobileListBulkSelectionProps = {
  enableSelection: boolean
  selectionMode: 'multiple'
  selectedKeys: Set<string>
  onSelectionChange: (keys: Selection) => void
}

export const useMobileListBulkSelection = (
  ids: ReadonlyArray<string>,
  { enabled }: { enabled: boolean },
): MobileListBulkSelectionProps => {
  const { selectedIds } = useSelectedIds()
  const { selectMultiple, deselectMultiple } = useBulkSelectionActions()

  const selectedKeys = useMemo(
    () => new Set(ids.filter(id => selectedIds.has(id))),
    [ids, selectedIds],
  )

  const onSelectionChange = useCallback((keys: Selection) => {
    if (keys === 'all') {
      selectMultiple([...ids])
      return
    }
    const next = new Set<string>()
    keys.forEach(key => next.add(String(key)))

    const toAdd = ids.filter(id => next.has(id) && !selectedIds.has(id))
    const toRemove = ids.filter(id => !next.has(id) && selectedIds.has(id))

    if (toAdd.length > 0) {
      selectMultiple(toAdd)
    }
    if (toRemove.length > 0) {
      deselectMultiple(toRemove)
    }
  }, [ids, selectedIds, selectMultiple, deselectMultiple])

  return useMemo(() => ({
    enableSelection: enabled,
    selectionMode: 'multiple' as const,
    selectedKeys,
    onSelectionChange,
  }), [enabled, selectedKeys, onSelectionChange])
}
