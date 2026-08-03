import { useCallback, useState } from 'react'

type UseMobileListExpansionOptions = {
  defaultExpandedIds?: ReadonlyArray<string>
}

export const useMobileListExpansion = (
  ids: ReadonlyArray<string>,
  { defaultExpandedIds }: UseMobileListExpansionOptions = {},
) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  )

  const open = useCallback((id: string) => {
    setExpandedKeys(prev => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  const close = useCallback((id: string) => {
    setExpandedKeys((prev) => {
      if (!prev.has(id)) {
        return prev
      }
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      }
      else {
        next.add(id)
      }
      return next
    })
  }, [])

  const closeAll = useCallback(() => {
    setExpandedKeys(prev => (prev.size === 0 ? prev : new Set()))
  }, [])

  const openNext = useCallback((id: string) => {
    const index = ids.indexOf(id)
    const nextId = index >= 0 ? ids[index + 1] : undefined
    if (nextId) {
      open(nextId)
    }
  }, [ids, open])

  return { expandedKeys, open, close, toggle, closeAll, openNext }
}
