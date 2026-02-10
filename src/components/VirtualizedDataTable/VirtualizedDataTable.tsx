import { useMemo, useRef } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import classNames from 'classnames'

import { HStack } from '@ui/Stack/Stack'
import { Cell, Column as TableColumn, Row, Table, TableBody, TableHeader } from '@ui/Table/Table'
import { getColumnDefs, type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { Loader } from '@components/Loader/Loader'

import './virtualizedDataTable.scss'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isRowHeader: boolean
  }
}

const DEFAULT_ROW_HEIGHT = 52
const DEFAULT_OVERSCAN = 5
const DEFAULT_NUM_ROWS = 15
const HEADER_HEIGHT = 52
const DEFAULT_TABLE_HEIGHT = (DEFAULT_ROW_HEIGHT * DEFAULT_NUM_ROWS) + HEADER_HEIGHT - 2

const CSS_PREFIX = 'Layer__UI__VirtualizedTable'
const EMPTY_ARRAY: never[] = []

export interface VirtualizedDataTableProps<TData extends { id: string }> {
  columnConfig: NestedColumnConfig<TData>
  data: TData[] | undefined
  componentName: string
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  shrinkHeightToFitRows?: boolean
  // Virtualization-specific props
  height?: number
  rowHeight?: number
  overscan?: number
}

export const VirtualizedDataTable = <TData extends { id: string }>({
  columnConfig,
  data,
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  shrinkHeightToFitRows = false,
  height = DEFAULT_TABLE_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
}: VirtualizedDataTableProps<TData>) => {
  const { EmptyState, ErrorState } = slots
  const containerRef = useRef<HTMLDivElement>(null)

  const renderedTableHeight = useMemo(() => {
    if (!data) return height
    if (!shrinkHeightToFitRows) return height
    const actualRowCount = data.length
    const calculatedHeight = (actualRowCount * rowHeight) + HEADER_HEIGHT + 1
    return Math.min(height, calculatedHeight)
  }, [data, height, rowHeight, shrinkHeightToFitRows])

  const tableData = data ?? EMPTY_ARRAY

  const columnDefs = getColumnDefs(columnConfig)

  const table = useReactTable<TData>({
    data: tableData,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()
  const processedData = useMemo(() => rows.map(r => r.original), [rows])

  const isEmptyTable = processedData.length === 0
  const hasData = processedData.length > 0

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: hasData ? processedData.length : 0,
    estimateSize: () => rowHeight,
    getScrollElement: () => containerRef.current,
    measureElement:
      typeof window !== 'undefined'
      && navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan,
  })

  if (isError) {
    return (
      <HStack align='center' justify='center' className={`${CSS_PREFIX}__state-container`}>
        <ErrorState />
      </HStack>
    )
  }

  if (isLoading) {
    return (
      <HStack align='center' justify='center' className={`${CSS_PREFIX}__state-container`}>
        <Loader />
      </HStack>
    )
  }

  if (isEmptyTable) {
    return (
      <HStack align='center' justify='center' className={`${CSS_PREFIX}__state-container`}>
        <EmptyState />
      </HStack>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div className={`${CSS_PREFIX}__container`} ref={containerRef} style={{ height: renderedTableHeight }} aria-label={ariaLabel}>
      <Table className={classNames(CSS_PREFIX, `Layer__UI__Table__${componentName}`)} aria-label={ariaLabel}>
        <TableHeader className={`${CSS_PREFIX}__header`} style={{ height: HEADER_HEIGHT }}>
          {table.getFlatHeaders().map(header => (
            <TableColumn
              key={header.id}
              isRowHeader={header.column.columnDef.meta?.isRowHeader}
              className={classNames(
                `${CSS_PREFIX}__header-cell`,
                `Layer__UI__Table-Column__${componentName}--${header.id}`,
              )}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </TableColumn>
          ),
          )}
        </TableHeader>
        <TableBody style={{ height: totalSize }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index]
            if (!row) return null
            return (
              <Row
                key={row.id}
                className={`${CSS_PREFIX}__row`}
                data-index={virtualRow.index}
                ref={node => node && rowVirtualizer.measureElement(node)}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map(cell => (
                  <Cell
                    key={cell.id}
                    className={classNames(
                      `${CSS_PREFIX}__cell`,
                      `Layer__UI__Table-Cell__${componentName}--${cell.column.id}`,
                    )}
                    style={{ ...(virtualRow.index === 0 && ({ borderTop: 'none' })) }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Cell>
                ))}
              </Row>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
