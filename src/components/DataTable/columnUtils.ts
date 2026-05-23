import { type ColumnDef, createColumnHelper, type HeaderGroup, type Row } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

import { type Alignment } from '@schemas/reports/unifiedReport'
import type { ColumnHeaderWidths } from '@hooks/utils/tables/useColumnHeaderWidths'

export type ColumnPinningSide = 'left' | 'right'

type BaseColumn = {
  id: string
  header?: React.ReactNode
  alignment?: Alignment
  isRowHeader?: boolean
}

export type CellRenderer<TData> = ((row: Row<TData>) => React.ReactNode)

export type LeafColumn<TData> = BaseColumn & {
  cell: CellRenderer<TData>
  pinning?: ColumnPinningSide
}

export type GroupColumn<TData> = BaseColumn & {
  columns: ColumnNode<TData>[]
}

export type ColumnNode<TData> = LeafColumn<TData> | GroupColumn<TData>

export const isLeafColumn = <TData>(col: ColumnNode<TData>): col is LeafColumn<TData> => {
  return 'cell' in col
}

export type NestedColumnConfig<TData> = ColumnNode<TData>[]

const getColumnMeta = (col: BaseColumn) => ({
  alignment: col.alignment,
  isRowHeader: col.isRowHeader ?? false,
})

export const getColumnDefs = <TData>(
  columnConfig: NestedColumnConfig<TData>,
): ColumnDef<TData>[] => {
  const columnHelper = createColumnHelper<TData>()

  return columnConfig.map((col): ColumnDef<TData> => {
    if (isLeafColumn(col)) {
      return columnHelper.display({
        id: col.id,
        header: () => col.header,
        cell: ({ row }) => col.cell(row),
        meta: getColumnMeta(col),
      })
    }

    return columnHelper.group({
      id: col.id,
      header: () => col.header,
      columns: getColumnDefs(col.columns),
      meta: getColumnMeta(col),
    })
  })
}

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
