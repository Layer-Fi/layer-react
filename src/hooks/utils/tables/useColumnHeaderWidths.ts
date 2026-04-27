import { type RefObject, useLayoutEffect, useState } from 'react'

export type ColumnHeaderWidths = Readonly<Record<string, number>>

type WidthsState = Record<string, number>

const WIDTH_CHANGE_THRESHOLD_PX = 0.5

const getLeafHeaderCells = (header: HTMLElement | null): HTMLElement[] | null => {
  const leafRow = header?.lastElementChild
  if (!leafRow) return null
  return Array.from(leafRow.children) as HTMLElement[]
}

const computeUpdatedWidths = (
  prev: WidthsState,
  columnIds: readonly string[],
  cells: readonly HTMLElement[],
): WidthsState => {
  let next = prev
  columnIds.forEach((id, i) => {
    const cell = cells[i]
    if (!cell) return
    const width = cell.getBoundingClientRect().width
    if (Math.abs((prev[id] ?? 0) - width) < WIDTH_CHANGE_THRESHOLD_PX) return
    if (next === prev) next = { ...prev }
    next[id] = width
  })
  return next
}

export const useColumnHeaderWidths = (
  headerRef: RefObject<HTMLElement | null>,
  columnIds: readonly string[],
): ColumnHeaderWidths => {
  const [widths, setWidths] = useState<WidthsState>({})
  const idsKey = columnIds.join('|')

  useLayoutEffect(() => {
    const cells = getLeafHeaderCells(headerRef.current)
    if (!cells) return

    const measure = () => {
      setWidths(prev => computeUpdatedWidths(prev, columnIds, cells))
    }

    measure()
    const observer = new ResizeObserver(measure)
    cells.forEach(cell => observer.observe(cell))
    return () => observer.disconnect()
  // `columnIds` array identity changes per render; its content is tracked via `idsKey`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerRef, idsKey])

  return widths
}
