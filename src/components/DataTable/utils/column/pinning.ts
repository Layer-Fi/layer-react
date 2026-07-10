import { type HeaderGroup } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

import { isLeafColumn, type NestedColumnConfig } from '@components/DataTable/utils/column/nesting'

export type ColumnPinningSide = 'left' | 'right'
export type ColumnHeaderWidths = Readonly<Record<string, number>>

export const computePinningStyles = <TData>(
  headerGroups: HeaderGroup<TData>[],
  widths: ColumnHeaderWidths,
): ReadonlyMap<string, CSSProperties> => {
  const leafHeaders = headerGroups.at(-1)?.headers ?? []
  const styles = new Map<string, CSSProperties>()

  const accumulate = (headersInOrder: typeof leafHeaders, side: ColumnPinningSide) => {
    let offset = 0

    for (const header of headersInOrder) {
      if (header.column.getIsPinned() !== side) continue

      styles.set(header.column.id, { position: 'sticky', [side]: `${offset}px` })
      offset += widths[header.column.id] ?? 0
    }
  }

  accumulate(leafHeaders, 'left')
  accumulate([...leafHeaders].reverse(), 'right')

  return styles
}

export const getColumnPinning = <TData>(
  columnConfig: NestedColumnConfig<TData>,
): { left: string[], right: string[] } => {
  const left: string[] = []
  const right: string[] = []

  for (const col of columnConfig) {
    if (isLeafColumn(col)) {
      if (col.pinning === 'left') left.push(col.id)
      else if (col.pinning === 'right') right.push(col.id)
    }
    else {
      const nested = getColumnPinning(col.columns)
      left.push(...nested.left)
      right.push(...nested.right)
    }
  }

  return { left, right }
}
