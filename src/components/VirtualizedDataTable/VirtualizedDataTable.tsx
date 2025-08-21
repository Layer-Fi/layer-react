import { useRef, useMemo } from 'react'
import classNames from 'classnames'
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
} from '@tanstack/react-table'
import { Loader } from '../Loader/Loader'
import type { ColumnConfig, Column } from '../DataTable/DataTable'
import { Table, TableBody, TableHeader, Column as TableColumn, Row, Cell } from '../ui/Table/Table'
import { HStack } from '../ui/Stack/Stack'

const DEFAULT_ROW_HEIGHT = 52
const DEFAULT_OVERSCAN = 5
const DEFAULT_NUM_ROWS = 15
const HEADER_HEIGHT = 52
const DEFAULT_TABLE_HEIGHT = (DEFAULT_ROW_HEIGHT * DEFAULT_NUM_ROWS) + HEADER_HEIGHT

const CSS_PREFIX = 'Layer__UI__VirtualizedTable'
const EMPTY_ARRAY: never[] = []

export interface VirtualizedDataTableProps<TData extends { id: string }, TColumns extends string> {
  columnConfig: ColumnConfig<TData, TColumns>
  data: TData[] | undefined
  componentName: string
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  // Virtualization-specific props
  height?: number
  rowHeight?: number
  overscan?: number
}

export const VirtualizedDataTable = <TData extends { id: string }, TColumns extends string>({
  columnConfig,
  data,
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  height = DEFAULT_TABLE_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
}: VirtualizedDataTableProps<TData, TColumns>) => {
  const { EmptyState, ErrorState } = slots
  const containerRef = useRef<HTMLDivElement>(null)

  const actualHeight = useMemo(() => {
    if (!data) return height
    const actualRowCount = data.length
    const calculatedHeight = (actualRowCount * rowHeight) + HEADER_HEIGHT + 1
    return Math.min(height, calculatedHeight)
  }, [data, height, rowHeight])

  const columnHelper = createColumnHelper<TData>()
  const columns: Column<TData, TColumns>[] = Object.values(columnConfig)
  const tableData = data ?? EMPTY_ARRAY

  const columnDefs = columns.map((col) => {
    return columnHelper.display({
      id: col.id,
      header: () => col.header,
      cell: ({ row }) => col.cell(row.original),
      meta: {
        isRowHeader: col.isRowHeader,
        originalColumn: col,
      },
    })
  })

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

  const CSS_PREFIX = 'Layer__UI__VirtualizedTable'

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
    <div
      className={`${CSS_PREFIX}__container`}
      ref={containerRef}
      style={{ height: actualHeight }}
      role='table'
      aria-label={ariaLabel}
    >
      <Table className='Layer__UI__Table__ProfitAndLossDetailReport' aria-label={ariaLabel}>

        <TableHeader
          columns={columns.map(col => ({
            id: col.id,
            header: col.header,
            isRowHeader: col.isRowHeader ?? false,
          }))}
        >
          {({ id, header, isRowHeader }) => (
            <TableColumn
              key={id}
              isRowHeader={isRowHeader}
              className={classNames(
                `${CSS_PREFIX}__header-cell`,
                `Layer__UI__Table-Column__${componentName}--${id}`,
              )}
            >
              {header}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          <Row
            className={`${CSS_PREFIX}__spacer`}
            style={{ height: totalSize }}
          />
          {virtualItems.map((virtualRow) => {
            const rowData = processedData[virtualRow.index]
            return (
              <VirtualizedDataTableRow
                key={rowData.id}
                rowData={rowData}
                virtualRow={virtualRow}
                rowVirtualizer={rowVirtualizer}
                componentName={componentName}
                cssPrefix={CSS_PREFIX}
                columns={columns}
              />
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

interface VirtualizedDataTableRowProps<TData extends { id: string }, TColumns extends string> {
  rowData: TData
  virtualRow: VirtualItem
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
  componentName: string
  cssPrefix: string
  columns: Column<TData, TColumns>[]
}

const VirtualizedDataTableRow = <TData extends { id: string }, TColumns extends string>({
  rowData,
  virtualRow,
  rowVirtualizer,
  componentName,
  columns,
}: VirtualizedDataTableRowProps<TData, TColumns>) => (
  <Row
    className={classNames(
      `${CSS_PREFIX}__row`,
    )}
    data-index={virtualRow.index}
    ref={node => node && rowVirtualizer.measureElement(node)}
    style={{
      transform: `translateY(${virtualRow.start}px)`,
    }}
  >
    {columns.map(column => (
      <Cell
        key={column.id}
        className={classNames(
          `${CSS_PREFIX}__cell`,
          `Layer__UI__Table-Cell__${componentName}--${column.id}`,
        )}
        style={{ ...(virtualRow.index === 0 && ({ borderTop: 'none' })) }}
      >
        {column.cell(rowData)}
      </Cell>
    ))}
  </Row>
)
