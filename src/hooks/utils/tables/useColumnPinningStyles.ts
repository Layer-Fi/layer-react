import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { HeaderGroup } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

import { type ColumnHeaderWidths, computePinningStyles } from '@components/DataTable/utils/column/pinning'

type UseColumnPinningStylesOptions = {
  isEnabled?: boolean
}

const EMPTY_PINNING_STYLES = new Map<string, CSSProperties>()

const getLeafHeaderCells = (header: HTMLElement | null): HTMLElement[] => {
  const leafRow = header?.lastElementChild
  if (!leafRow) return []
  return Array.from(leafRow.children) as HTMLElement[]
}

const getColumnHeaderWidths = (
  columnIds: readonly string[],
  cells: readonly HTMLElement[],
): ColumnHeaderWidths => {
  return Object.fromEntries(
    columnIds.flatMap((id, i) => {
      const cell = cells[i]
      return cell ? [[id, cell.getBoundingClientRect().width]] : []
    }),
  )
}

const arePinningStylesEqual = (
  current: ReadonlyMap<string, CSSProperties>,
  next: ReadonlyMap<string, CSSProperties>,
) => {
  if (current.size !== next.size) return false

  for (const [id, nextStyle] of next) {
    const currentStyle = current.get(id)
    if (!currentStyle) return false
    if (currentStyle.position !== nextStyle.position) return false
    if (currentStyle.left !== nextStyle.left) return false
    if (currentStyle.right !== nextStyle.right) return false
  }

  return true
}

export const useColumnPinningStyles = <TData>(
  headerGroups: HeaderGroup<TData>[],
  { isEnabled = true }: UseColumnPinningStylesOptions = {},
) => {
  const headerRef = useRef<HTMLTableSectionElement>(null)
  const [pinningStyles, setPinningStyles] = useState<ReadonlyMap<string, CSSProperties>>(EMPTY_PINNING_STYLES)

  const leafColumnIds = useMemo(
    () => headerGroups.at(-1)?.headers.map(h => h.column.id) ?? [],
    [headerGroups],
  )

  useLayoutEffect(() => {
    // Clear stale measurements while fallback rows are rendered.
    if (!isEnabled) {
      setPinningStyles(current => current.size === 0 ? current : EMPTY_PINNING_STYLES)
      return
    }

    const cells = getLeafHeaderCells(headerRef.current)
    if (cells.length === 0) return

    // Measure and compute sticky offsets before paint so pinned columns move together.
    const updatePinningStyles = () => {
      const widths = getColumnHeaderWidths(leafColumnIds, cells)
      const nextPinningStyles = computePinningStyles(headerGroups, widths)
      setPinningStyles(current => arePinningStylesEqual(current, nextPinningStyles) ? current : nextPinningStyles)
    }

    updatePinningStyles()

    // Keep offsets in sync when column widths change after the initial layout.
    const observer = new ResizeObserver(updatePinningStyles)
    cells.forEach(cell => observer.observe(cell))
    return () => observer.disconnect()
  }, [headerGroups, isEnabled, leafColumnIds])

  return { headerRef, pinningStyles }
}
