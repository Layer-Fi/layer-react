/**
 * A leaf column that renders cell content.
 */

import { type ColumnDef, createColumnHelper, type Row } from '@tanstack/react-table'

export type LeafColumn<TData> = {
  id: string
  header?: React.ReactNode
  cell: (row: Row<TData>) => React.ReactNode
  isRowHeader?: true
}
/**
 * A group column that contains nested columns (for multi-row headers).
 */

export type GroupColumn<TData> = {
  id: string
  header?: React.ReactNode
  columns: ColumnNode<TData>[]
}
/**
 * A column can be either a leaf (with cell renderer) or a group (with nested columns).
 */

export type ColumnNode<TData> = LeafColumn<TData> | GroupColumn<TData>
/**
 * Type guard to check if a column is a leaf column.
 */

export const isLeafColumn = <TData>(col: ColumnNode<TData>): col is LeafColumn<TData> => {
  return 'cell' in col
}
/**
 * Type guard to check if a column is a group column.
 */

export const isGroupColumn = <TData>(col: ColumnNode<TData>): col is GroupColumn<TData> => {
  return 'columns' in col
}
/**
 * Flattens nested columns to get only leaf columns.
 */

export const flattenColumns = <TData>(columns: ColumnNode<TData>[]): LeafColumn<TData>[] => {
  const result: LeafColumn<TData>[] = []

  const traverse = (cols: ColumnNode<TData>[]) => {
    for (const col of cols) {
      if (isLeafColumn(col)) {
        result.push(col)
      }
      else {
        traverse(col.columns)
      }
    }
  }

  traverse(columns)
  return result
}

export type NestedColumnConfig<TData> = ColumnNode<TData>[]

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
        meta: {
          isRowHeader: col.isRowHeader || false,
        },
      })
    }

    return columnHelper.group({
      id: col.id,
      header: () => col.header,
      columns: getColumnDefs(col.columns),
    })
  })
}
