import { type ColumnDef, createColumnHelper, type Row } from '@tanstack/react-table'

import { type Alignment } from '@schemas/reports/unifiedReport'

type BaseColumn = {
  id: string
  header?: React.ReactNode
  alignment?: Alignment
  isRowHeader?: boolean
}

export type LeafColumn<TData> = BaseColumn & {
  cell: (row: Row<TData>) => React.ReactNode
}

export type GroupColumn<TData> = BaseColumn & {
  columns: ColumnNode<TData>[]
}

export type ColumnNode<TData> = LeafColumn<TData> | GroupColumn<TData>

export const isLeafColumn = <TData>(col: ColumnNode<TData>): col is LeafColumn<TData> => {
  return 'cell' in col
}

export const isGroupColumn = <TData>(col: ColumnNode<TData>): col is GroupColumn<TData> => {
  return 'columns' in col
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
