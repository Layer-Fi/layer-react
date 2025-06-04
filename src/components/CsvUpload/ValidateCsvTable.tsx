import { useMemo, useRef } from 'react'
import classNames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  Table,
  Row,
  CellContext,
} from '@tanstack/react-table'
import { PreviewCsv, PreviewRow } from './types'
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'

const ROW_HEIGHT = 52
const BODY_HEIGHT = ROW_HEIGHT * 10

interface ValidateCsvTableProps<T extends { [K in keyof T]: string | number }> {
  data: PreviewCsv<T>
  headers: { [K in keyof T]: string }
  formatters?: Partial<{ [K in keyof T]: (parsed: T[K]) => string }>
  className?: string
}

export function ValidateCsvTable<T extends { [K in keyof T]: string | number }>({ data, headers, formatters, className }: ValidateCsvTableProps<T>) {
  const columns = useMemo<ColumnDef<PreviewRow<T>>[]>(
    () => {
      const baseCellClassName = 'Layer__table-cell-content Layer__csv-upload__validate-csv-table__cell-content'
      const columnDefs: ColumnDef<PreviewRow<T>>[] = [{
        id: 'row',
        accessorKey: 'row',
        header: () => <span className='Layer__csv-upload__validate-csv-table__header-cell-content'>Row</span>,
        cell: (info: CellContext<PreviewRow<T>, unknown>) => (
          <span className={`${baseCellClassName} Layer__csv-upload__validate-csv-table__cell-content--row`}>
            {info.row.index + 2}
          </span>
        ),
      }]

      columnDefs.push(...(Object.keys(headers) as (keyof T)[]).map(key => ({
        id: key as string,
        accessorKey: key,
        header: () => <span className='Layer__csv-upload__validate-csv-table__header-cell-content'>{headers[key]}</span>,
        cell: (info: CellContext<PreviewRow<T>, unknown>) => {
          const field = info.row.original[key]

          let value: string | number = field.raw
          if (field.is_valid) {
            const formatter = formatters?.[key]
            value = formatter ? formatter(field.parsed as T[keyof T]) : field.parsed
          }

          const cellClassName = classNames(
            baseCellClassName,
            !field.is_valid && 'Layer__csv-upload__validate-csv-table__cell-content--error',
          )
          return <span className={cellClassName}>{value}</span>
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

  return (
    <div className={`${className} Layer__csv-upload__validate-csv-table__container`}>
      <table className='Layer__table'>
        <thead className='Layer__csv-upload__validate-csv-table__thead'>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className='Layer__csv-upload__validate-csv-table__header-row'>
              {headerGroup.headers.map((header) => {
                const headerCellClassName = classNames(
                  'Layer__table-header',
                  'Layer__csv-upload__validate-csv-table__header-cell',
                  `Layer__csv-upload__validate-csv-table__header-cell--${header.id}`,
                )
                return (
                  <th key={header.id} className={headerCellClassName}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
      </table>
      <ValidateCsvTableBody table={table} />
    </div>
  )
}

interface ValidateCsvTableBodyProps<T extends { [K in keyof T]: string | number }> {
  table: Table<PreviewRow<T>>
}

function ValidateCsvTableBody<T extends { [K in keyof T]: string | number }>({ table }: ValidateCsvTableBodyProps<T>) {
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
    <div ref={containerRef} className='Layer__csv-upload__validate-csv-table__scroll_container'>
      <table className='Layer__table'>
        <tbody>
          <tr style={{ height: BODY_HEIGHT }}>
            <td style={{ height: BODY_HEIGHT, padding: 0 }} colSpan={table.getAllColumns().length - 1} />
          </tr>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <ValidateCsvTableRow
                key={row.id}
                row={row}
                virtualRow={virtualRow}
                rowVirtualizer={rowVirtualizer}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface ValidateCsvTableRowProps<T extends { [K in keyof T]: string | number }> {
  row: Row<PreviewRow<T>>
  virtualRow: VirtualItem
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

function ValidateCsvTableRow<T extends { [K in keyof T]: string | number }>({ row, virtualRow, rowVirtualizer }: ValidateCsvTableRowProps<T>) {
  const tableRowClassName = classNames(
    'Layer__table-row',
    'Layer__csv-upload__validate-csv-table__row',
    !row.getValue('is_valid') && 'Layer__csv-upload__validate-csv-table__row--error',
  )

  return (
    <tr
      className={tableRowClassName}
      data-index={virtualRow.index}
      ref={node => rowVirtualizer.measureElement(node)}
      key={row.id}
      style={{ transform: `translateY(${virtualRow.start - BODY_HEIGHT}px)` }}
    >
      {row.getVisibleCells().map((cell) => {
        const tableCellClassName = classNames(
          'Layer__table-cell',
          'Layer__csv-upload__validate-csv-table__cell',
          `Layer__csv-upload__validate-csv-table__cell--${cell.column.columnDef.id}`,
        )
        return (
          <td key={cell.id} className={tableCellClassName}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
