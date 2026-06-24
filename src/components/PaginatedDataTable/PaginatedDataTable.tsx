import { type MutableRefObject, useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  type PaginationState,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import { VStack } from '@ui/Stack/Stack'
import { type BaseDataTableProps, type ClickableRowProps, DataTable } from '@components/DataTable/DataTable'
import { type ColumnConfig } from '@components/DataTable/utils/column'
import { getColumnPinning } from '@components/DataTable/utils/column/pinning'
import { type DataTableExpandedRowProps } from '@components/DataTable/utils/rows/expandedRows'
import { type DataTableSelectionProps, getColumnDefsWithSelection, getRowSelectionState } from '@components/DataTable/utils/rows/selection'
import { Pagination } from '@components/Pagination/Pagination'

import './paginatedDataTable.scss'

export interface TablePaginationProps {
  initialPage?: number
  onSetPage?: (page: number) => void
  pageSize?: number
  hasMore?: boolean
  fetchMore?: () => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
}

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
  paginationProps,
  slots,
  withClickableRow,
  isRowSelected,
  getRowClassName,
  selectionProps,
  expandedRowProps,
}: PaginatedTableProps<TData>) {
  const { pageSize = 20, hasMore, fetchMore, initialPage = 0, onSetPage, autoResetPageIndexRef } = paginationProps

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: initialPage, pageSize })

  useEffect(() => {
    setPagination(current => (
      current.pageIndex === initialPage && current.pageSize === pageSize
        ? current
        : { pageIndex: initialPage, pageSize }
    ))
  }, [initialPage, pageSize])

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
    [pagination],
  )

  const table = useReactTable<TData>({
    data: data ?? [],
    columns: columnDefs,
    state: { pagination, columnPinning, ...rowSelectionState },
    onPaginationChange: (updaterOrValue) => {
      const newPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue
      onSetPage?.(newPagination.pageIndex)
      setPagination(newPagination)
    },
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
    table.setPageIndex(page - 1)
  }, [table])

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
