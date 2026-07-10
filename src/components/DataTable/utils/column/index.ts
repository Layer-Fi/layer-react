import { type ColumnDef, createColumnHelper, type Row } from '@tanstack/react-table'

import { type Alignment } from '@schemas/reports/unifiedReport'
import { type ColumnPinningSide } from '@components/DataTable/utils/column/pinning'

export type BaseColumn = {
  id: string
  header?: React.ReactNode
  alignment?: Alignment
  isRowHeader?: boolean
  preventRowClick?: boolean
}

export type CellRenderer<TData> = ((row: Row<TData>) => React.ReactNode)

export type DataTableColumn<TData> = BaseColumn & {
  cell: CellRenderer<TData>
  pinning?: ColumnPinningSide
}

export type ColumnConfig<TData> = DataTableColumn<TData>[]

export const getColumnMeta = (col: BaseColumn) => ({
  alignment: col.alignment,
  isRowHeader: col.isRowHeader ?? false,
  preventRowClick: col.preventRowClick,
})

export const getColumnDefs = <TData>(
  columnConfig: ColumnConfig<TData>,
): ColumnDef<TData>[] => {
  const columnHelper = createColumnHelper<TData>()

  return columnConfig.map(col => columnHelper.display({
    id: col.id,
    header: () => col.header,
    cell: ({ row }) => col.cell(row),
    meta: getColumnMeta(col),
  }))
}
