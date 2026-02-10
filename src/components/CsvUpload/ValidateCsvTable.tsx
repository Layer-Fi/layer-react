import { useMemo, useRef } from 'react'
import {
  type CellContext,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer, type VirtualItem, type Virtualizer } from '@tanstack/react-virtual'
import classNames from 'classnames'

import { type PreviewCsv, type PreviewRow } from '@components/CsvUpload/types'

const ROW_HEIGHT = 52
const MAX_NUM_ROWS = 8
const HEADER_HEIGHT = 41
const CONTAINER_HEIGHT = ROW_HEIGHT * MAX_NUM_ROWS + HEADER_HEIGHT - 1

const CSS_PREFIX = 'Layer__csv-upload__validate-csv-table'

interface ValidateCsvTableProps<T extends { [K in keyof T]: string | number | null | undefined }> {
  data: PreviewCsv<T>
  headers: { [K in keyof T]: string }
  formatters?: Partial<{ [K in keyof T]: (parsed: T[K]) => string }>
  className?: string
}

export function ValidateCsvTable<T extends { [K in keyof T]: string | number | null | undefined }>({
  data,
  headers,
  formatters,
  className,
}: ValidateCsvTableProps<T>) {
  const columns = useMemo<ColumnDef<PreviewRow<T>>[]>(
    () => {
      const columnDefs: ColumnDef<PreviewRow<T>>[] = [{
        id: 'row',
        accessorKey: 'row',
        header: () => <span className={`${CSS_PREFIX}__header-cell-content ${CSS_PREFIX}__header-cell-content--row`}>Row</span>,
        cell: (info: CellContext<PreviewRow<T>, unknown>) => (
          <span className={`Layer__table-cell-content ${CSS_PREFIX}__cell-content ${CSS_PREFIX}__cell-content--row`}>
            {info.row.original.row}
          </span>
        ),
      }]

      columnDefs.push(...(Object.keys(headers) as (keyof T)[]).map(key => ({
        id: key as string,
        accessorKey: key,
        header: () => <span className={`${CSS_PREFIX}__header-cell-content`}>{headers[key]}</span>,
        cell: (info: CellContext<PreviewRow<T>, unknown>) => {
          const field = info.row.original[key]

          let value: string | number | null | undefined = field?.raw
          const isValid = field && field.is_valid
          if (isValid) {
            const formatter = formatters?.[key]
            value = formatter ? formatter(field.parsed as T[keyof T]) : field.parsed
          }
          return (
            <span className={classNames(
              'Layer__table-cell-content',
              `${CSS_PREFIX}__cell-content`,
              !isValid && `${CSS_PREFIX}__cell-content--error`,
            )}
            >
              {value}
            </span>
          )
        },
      })))

      columnDefs.push({
        id: 'is_valid',
        accessorKey: 'is_valid',
        header: 'is_valid',
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId)
          const b = rowB.getValue(columnId)
          return a === b ? 0 : a === false ? -1 : 1
        },
      })

      return columnDefs
    },
    [headers, formatters],
  )

  const state = useMemo(() => ({
    sorting: [{ id: 'is_valid', desc: false }],
    columnVisibility: {
      ['is_valid']: false,
    },
  }), [])

  const table = useReactTable({
    data,
    columns,
    state,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()
  const containerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => containerRef.current,
    measureElement:
      typeof window !== 'undefined'
      && navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  return (
    <div className={`${CSS_PREFIX}__container`} ref={containerRef} style={{ height: CONTAINER_HEIGHT }}>
      <table className={`Layer__table ${className}`}>
        <thead className={`${CSS_PREFIX}__header`}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className={`${CSS_PREFIX}__header-row`} style={{ height: HEADER_HEIGHT }}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={classNames(
                    'Layer__table-header',
                    `${CSS_PREFIX}__header-cell`,
                    `${CSS_PREFIX}__header-cell--${header.id}`,
                  )}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ),
              )}
            </tr>
          ))}
        </thead>
        <tbody>
          <tr
            className={classNames(
              'Layer__table-row',
              `${CSS_PREFIX}__row`,
              rows.length < MAX_NUM_ROWS && `${CSS_PREFIX}__row--bottom-border`,
            )}
            style={{ height: rows.length * ROW_HEIGHT }}
          />
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            if (!row) return null
            return (
              <ValidateCsvTableRow key={row.id} row={row} virtualRow={virtualRow} rowVirtualizer={rowVirtualizer} />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface ValidateCsvTableRowProps<T extends { [K in keyof T]: string | number | null | undefined }> {
  row: Row<PreviewRow<T>>
  virtualRow: VirtualItem
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

const ValidateCsvTableRow = <T extends { [K in keyof T]: string | number | null | undefined }>({
  row,
  virtualRow,
  rowVirtualizer,
}: ValidateCsvTableRowProps<T>) =>
  (
    <tr
      className={classNames(
        'Layer__table-row',
        `${CSS_PREFIX}__row`,
        !row.getValue('is_valid') && `${CSS_PREFIX}__row--error`,
      )}
      data-index={virtualRow.index}
      ref={node => rowVirtualizer.measureElement(node)}
      key={row.id}
      style={{ transform: `translateY(${virtualRow.start}px)`, top: HEADER_HEIGHT }}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            className={classNames(
              'Layer__table-cell',
              `${CSS_PREFIX}__cell`,
              `${CSS_PREFIX}__cell--${cell.column.columnDef.id}`,
            )}
            style={{ ...(virtualRow.index === 0 && ({ borderTop: 'none' })) }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
