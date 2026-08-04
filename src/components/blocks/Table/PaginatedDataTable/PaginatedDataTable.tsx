import { useCallback, useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import { PaginationChangeSource, type TablePaginationProps } from '@hooks/utils/pagination/types'
import { Pagination } from '@ui/Pagination/Pagination'
import { VStack } from '@ui/Stack/Stack'
import { type BaseDataTableProps, type ClickableRowProps, DataTable } from '@blocks/Table/DataTable/DataTable'
import { type ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { getColumnPinning } from '@blocks/Table/DataTable/utils/column/pinning'
import { type DataTableExpandedRowProps } from '@blocks/Table/DataTable/utils/rows/expandedRows'
import { type DataTableSelectionProps, getColumnDefsWithSelection, getRowSelectionState } from '@blocks/Table/DataTable/utils/rows/selection'
import { usePaginatedTableState } from '@blocks/Table/PaginatedDataTable/usePaginatedTableState'

import './paginatedDataTable.scss'

interface PaginatedTableProps<TData> extends BaseDataTableProps {
  data: TData[] | undefined
  columnConfig: ColumnConfig<TData>
  paginationProps: TablePaginationProps
  withClickableRow?: ClickableRowProps<TData>
  isRowSelected?: (row: Row<TData>) => boolean
  getRowClassName?: (row: Row<TData>, index: number) => string | undefined
  selectionProps?: DataTableSelectionProps<TData>
  expandedRowProps?: DataTableExpandedRowProps<TData>
}

export function PaginatedTable<TData extends { id: string }>({
  data,
  isLoading,
  isError,
  columnConfig,
  componentName,
  ariaLabel,
  className,
  paginationProps,
  slots,
  withClickableRow,
  isRowSelected,
  getRowClassName,
  selectionProps,
  expandedRowProps,
}: PaginatedTableProps<TData>) {
  const { pageSize = 20, hasMore, fetchMore, pageIndex, onPageIndexChange, autoResetPageIndexRef } = paginationProps
  const { changePaginationSource, onPaginationChange, pagination } = usePaginatedTableState({
    pageIndex,
    pageSize,
    onPageIndexChange,
    data,
  })

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

  const dependencies = useMemo(
    () => [pagination.pageIndex, pagination.pageSize],
    [pagination.pageIndex, pagination.pageSize],
  )

  const table = useReactTable<TData>({
    data: data ?? [],
    columns: columnDefs,
    state: { pagination, columnPinning, ...rowSelectionState },
    onPaginationChange,
    onRowSelectionChange: selectionProps?.onRowSelectionChange,
    enableRowSelection: selectionProps?.enableRowSelection ?? !!selectionProps,
    getRowCanExpand: expandedRowProps?.getRowCanExpand,
    getExpandedRowModel: expandedRowProps ? getExpandedRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: autoResetPageIndexRef?.current ?? false,
    getRowId: row => row.id,
  })

  const { rows } = table.getRowModel()

  const onPageChange = useCallback((page: number) => {
    const nextPageIndex = page - 1

    if (nextPageIndex === table.getState().pagination.pageIndex) return

    changePaginationSource(PaginationChangeSource.User)
    table.setPageIndex(nextPageIndex)
  }, [changePaginationSource, table])

  const headerGroups = table.getHeaderGroups()
  const numColumns = table.getVisibleLeafColumns().length

  return (
    <VStack>
      <DataTable
        ariaLabel={ariaLabel}
        numColumns={numColumns}
        data={rows}
        isLoading={isLoading}
        isError={isError}
        dependencies={dependencies}
        componentName={componentName}
        className={className}
        slots={slots}
        headerGroups={headerGroups}
        withClickableRow={withClickableRow}
        isRowSelected={isRowSelected}
        getRowClassName={getRowClassName}
        renderExpandedRow={expandedRowProps?.render}
      />
      {!isError && !isLoading && (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          onPageChange={onPageChange}
          pageSize={table.getState().pagination.pageSize}
          totalCount={table.getRowCount()}
          hasMore={hasMore}
          fetchMore={fetchMore}
          className='Layer__PaginatedDataTable__Pagination'
        />
      )}
    </VStack>
  )
}
