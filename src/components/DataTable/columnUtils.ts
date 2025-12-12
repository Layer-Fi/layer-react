import { type ColumnDef, createColumnHelper, type Row } from '@tanstack/react-table'

export type LeafColumn<TData> = {
  id: string
  header?: React.ReactNode
  cell: (row: Row<TData>) => React.ReactNode
  isRowHeader?: true
}

export type GroupColumn<TData> = {
  id: string
  header?: React.ReactNode
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
