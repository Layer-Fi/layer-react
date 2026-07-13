import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { type BaseColumn, type DataTableColumn, getColumnMeta } from '@components/DataTable/utils/column'

export type GroupColumn<TData> = BaseColumn & {
  columns: ColumnNode<TData>[]
}

export type LeafColumn<TData> = DataTableColumn<TData>

export type ColumnNode<TData> = LeafColumn<TData> | GroupColumn<TData>

export const isLeafColumn = <TData>(col: ColumnNode<TData>): col is LeafColumn<TData> => {
  return 'cell' in col
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
