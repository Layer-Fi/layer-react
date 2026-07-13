import { useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import { type BaseDataTableProps, type ClickableRowProps, DataTable } from '@components/DataTable/DataTable'
import { type ColumnConfig } from '@components/DataTable/utils/column'
import { getColumnPinning } from '@components/DataTable/utils/column/pinning'
import { type DataTableExpandedRowProps } from '@components/DataTable/utils/rows/expandedRows'
import { type DataTableSelectionProps, getColumnDefsWithSelection, getRowSelectionState } from '@components/DataTable/utils/rows/selection'

const EMPTY_ARRAY: [] = []

export interface SimpleDataTableProps<TData> extends BaseDataTableProps {
  data: TData[] | undefined
  columnConfig: ColumnConfig<TData>
  withClickableRow?: ClickableRowProps<TData>
  isRowSelected?: (row: Row<TData>) => boolean
  getRowClassName?: (row: Row<TData>, index: number) => string | undefined
  selectionProps?: DataTableSelectionProps<TData>
  expandedRowProps?: DataTableExpandedRowProps<TData>
}

export const SimpleDataTable = <TData extends { id: string }>({
  data,
  columnConfig,
  selectionProps,
  expandedRowProps,
  ...rest
}: SimpleDataTableProps<TData>) => {
  const columnDefs = useMemo(() => {
    return getColumnDefsWithSelection(columnConfig, selectionProps)
  }, [columnConfig, selectionProps])

  const columnPinning = useMemo(
    () => getColumnPinning(columnConfig),
    [columnConfig],
  )

  const rowSelectionState = useMemo(
    () => getRowSelectionState(selectionProps),
    [selectionProps],
  )

  const table = useReactTable<TData>({
    data: data ?? EMPTY_ARRAY,
    columns: columnDefs,
    state: { columnPinning, ...rowSelectionState },
    onRowSelectionChange: selectionProps?.onRowSelectionChange,
    enableRowSelection: selectionProps?.enableRowSelection ?? !!selectionProps,
    getRowCanExpand: expandedRowProps?.getRowCanExpand,
    getExpandedRowModel: expandedRowProps ? getExpandedRowModel() : undefined,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
  })

  const { rows } = table.getRowModel()
  const headerGroups = table.getHeaderGroups()
  const numColumns = table.getVisibleLeafColumns().length

  return (
    <DataTable<TData>
      data={rows}
      headerGroups={headerGroups}
      numColumns={numColumns}
      renderExpandedRow={expandedRowProps?.render}
      {...rest}
    />
  )
}
