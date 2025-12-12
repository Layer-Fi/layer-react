import { type MutableRefObject, useCallback, useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table'

import { VStack } from '@ui/Stack/Stack'
import { getColumnDefs, type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { type BaseDataTableProps, DataTable } from '@components/DataTable/DataTable'
import { Pagination } from '@components/Pagination/Pagination'

import './paginatedDataTable.scss'

interface PaginationProps {
  initialPage?: number
  onSetPage?: (page: number) => void
  pageSize?: number
  hasMore?: boolean
  fetchMore?: () => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
}
interface PaginatedTableProps<TData> extends BaseDataTableProps {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
  paginationProps: PaginationProps
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
}: PaginatedTableProps<TData>) {
  const { pageSize = 20, hasMore, fetchMore, initialPage = 0, onSetPage, autoResetPageIndexRef } = paginationProps

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: initialPage, pageSize })

  const columnDefs = getColumnDefs(columnConfig)

  const table = useReactTable<TData>({
    data: data ?? [],
    columns: columnDefs,
    state: { pagination },
    onPaginationChange: (updaterOrValue) => {
      const newPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue
      onSetPage?.(newPagination.pageIndex)
      setPagination(newPagination)
    },
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: autoResetPageIndexRef?.current ?? false,
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
        componentName={componentName}
        slots={slots}
        headerGroups={headerGroups}
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
