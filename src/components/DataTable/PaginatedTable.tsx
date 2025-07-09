import {
  useReactTable,
  getCoreRowModel,
  type PaginationState,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table'
import { DataTable, type Column, type DataTableProps } from './DataTable'
import { useCallback, useMemo, useState } from 'react'
import { VStack } from '../ui/Stack/Stack'
import { Pagination } from '../Pagination'

interface PaginationProps {
  pageSize?: number
  hasMore?: boolean
  fetchMore?: () => void
}
interface PaginatedTableProps<TData, TColumns extends string> extends DataTableProps<TData, TColumns> {
  paginationProps: PaginationProps
}

const EMPTY_ARRAY: never[] = []
export function PaginatedTable<TData extends { id: string }, TColumns extends string>({
  data,
  isLoading,
  columnConfig,
  componentName,
  ariaLabel = 'Paginated Table',
  paginationProps,
  slots,
}: PaginatedTableProps<TData, TColumns>) {
  const { pageSize = 20, hasMore, fetchMore } = paginationProps

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })
  const columnHelper = createColumnHelper<TData>()
  const columns: Column<TData, TColumns>[] = Object.values(columnConfig)

  const columnDefs = columns.map((col) => {
    return columnHelper.display({
      id: col.id,
      header: () => col.header,
      cell: ({ row }) => col.cell(row.original),
    })
  })

  const table = useReactTable<TData>({
    data: data ?? EMPTY_ARRAY,
    columns: columnDefs,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  })

  const { rows } = table.getRowModel()
  const rowData = useMemo(() => rows.map(r => r.original), [rows])

  const onPageChange = useCallback((page: number) => {
    table.setPageIndex(page - 1)
  }, [table])

  return (
    <VStack>
      <DataTable
        ariaLabel={ariaLabel}
        columnConfig={columnConfig}
        data={rowData}
        isLoading={isLoading}
        componentName={componentName}
        slots={slots}
      />
      <Pagination
        currentPage={table.getState().pagination.pageIndex + 1}
        onPageChange={onPageChange}
        pageSize={table.getState().pagination.pageSize}
        totalCount={table.getRowCount()}
        hasMore={hasMore}
        fetchMore={fetchMore}
      />
    </VStack>
  )
}
