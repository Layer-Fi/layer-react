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

    let measureFrame: number | null = null
    let subscribeFrame: number | null = null

    const onNextFrame = (frame: number | null, run: () => void) => {
      if (frame !== null) return frame
      return requestAnimationFrame(run)
    }

    const measure = () => {
      const cells = getLeafHeaderCells(container)
      if (cells.length === 0) return

      const widths = getColumnHeaderWidths(leafColumnIds, cells)
      const nextPinningStyles = computePinningStyles(headerGroups, widths)
      setPinningStyles(current => arePinningStylesEqual(current, nextPinningStyles) ? current : nextPinningStyles)
    }

    // Measuring writes sticky offsets back onto the observed cells, so defer out of the observer
    // callback to avoid "ResizeObserver loop completed with undelivered notifications".
    const resizeObserver = new ResizeObserver(() => {
      measureFrame = onNextFrame(measureFrame, () => {
        measureFrame = null
        measure()
      })
    })

    // Subscribing fires an initial observation, which is what drives the measure. Only the mutation
    // observer may call this — resizing into it would re-arm the observer on every callback.
    const subscribeToHeaderCells = () => {
      resizeObserver.disconnect()
      getLeafHeaderCells(container).forEach(cell => resizeObserver.observe(cell))
    }

    // Compute sticky offsets before paint so pinned columns land in place on the first frame.
    measure()
    subscribeToHeaderCells()

    // react-aria builds its collection after the first commit, so the header cells this measures
    // don't exist yet on the ARIA path — resubscribe as they appear and change.
    const mutationObserver = new MutationObserver(() => {
      subscribeFrame = onNextFrame(subscribeFrame, () => {
        subscribeFrame = null
        subscribeToHeaderCells()
      })
    })
    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      if (measureFrame !== null) cancelAnimationFrame(measureFrame)
      if (subscribeFrame !== null) cancelAnimationFrame(subscribeFrame)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [containerRef, headerGroups, isEnabled, leafColumnIds])

  return { pinningStyles }
}
