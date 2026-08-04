import { useLayoutEffect, useMemo, useState } from 'react'
import type { HeaderGroup } from '@tanstack/react-table'
import type { CSSProperties, RefObject } from 'react'

import { type ColumnHeaderWidths, computePinningStyles } from '@blocks/Table/DataTable/utils/column/pinning'

type UseColumnPinningStylesOptions = {
  isEnabled?: boolean
}

const EMPTY_PINNING_STYLES = new Map<string, CSSProperties>()

// Read the header out of the DOM rather than through a ref — react-aria's TableHeader doesn't
// forward one, so the ARIA path would never measure and pinning would silently do nothing.
const getLeafHeaderCells = (container: HTMLElement | null): HTMLElement[] => {
  const leafRow = container?.querySelector('.Layer__UI__Table-TableHeader')?.lastElementChild
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
  containerRef: RefObject<HTMLElement | null>,
  headerGroups: HeaderGroup<TData>[],
  { isEnabled = true }: UseColumnPinningStylesOptions = {},
) => {
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

    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => measure())

    // Measure and compute sticky offsets before paint so pinned columns move together.
    const measure = () => {
      const cells = getLeafHeaderCells(container)
      if (cells.length === 0) return

      // Keep offsets in sync when column widths change after the initial layout.
      resizeObserver.disconnect()
      cells.forEach(cell => resizeObserver.observe(cell))

      const widths = getColumnHeaderWidths(leafColumnIds, cells)
      const nextPinningStyles = computePinningStyles(headerGroups, widths)
      setPinningStyles(current => arePinningStylesEqual(current, nextPinningStyles) ? current : nextPinningStyles)
    }

    measure()

    // react-aria builds its collection after the first commit, so the header cells this measures
    // don't exist yet on the ARIA path — watch for them instead of measuring once.
    const mutationObserver = new MutationObserver(() => measure())
    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [containerRef, headerGroups, isEnabled, leafColumnIds])

  return { pinningStyles }
}
