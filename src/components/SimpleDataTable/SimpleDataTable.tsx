import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { getColumnDefs, type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { type BaseDataTableProps, DataTable } from '@components/DataTable/DataTable'

export interface SimpleDataTableProps<TData> extends BaseDataTableProps {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
}

export const SimpleDataTable = <TData extends { id: string }>({
  data,
  columnConfig,
  ...rest
}: SimpleDataTableProps<TData>) => {
  const columnDefs = getColumnDefs(columnConfig)

  const table = useReactTable<TData>({
    data: data ?? [],
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()
  const headerGroups = table.getHeaderGroups()
  const numColumns = table.getVisibleLeafColumns().length

  return (
    <DataTable<TData>
      data={rows}
      headerGroups={headerGroups}
      numColumns={numColumns}
      {...rest}
    />
  )
}
