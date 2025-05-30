import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { debounce } from 'lodash'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  Table,
  Row,
} from '@tanstack/react-table'
import { PreviewCsv, PreviewRow } from './types'
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'

interface ValidateCsvTableProps<T extends { [K in keyof T]: string | number }> {
  data: PreviewCsv<T>
  headers: { [K in keyof T]: string }
  formatters?: Partial<{ [K in keyof T]: (parsed: T[K]) => string }>
}

export function ValidateCsvTable<T extends { [K in keyof T]: string | number }>({ data, headers, formatters }: ValidateCsvTableProps<T>) {
  const columns = useMemo<ColumnDef<PreviewRow<T>>[]>(
    () =>
      (Object.keys(headers) as (keyof T)[]).map(key => ({
        accessorKey: key,
        header: headers[key],
        cell: (info) => {
          const field = info.row.original[key]

          let value: string | number = field.raw
          if (field.isValid) {
            const parsedValue = field.parsed
            const formatter = formatters?.[key]
            value = formatter ? formatter(parsedValue as T[keyof T]) : parsedValue
          }

          const cellClassName = classNames(
            'Layer__table-cell-content',
            !field.isValid && 'Layer__csv-upload__validate-csv-table__raw-field',
          )
          return <span className={cellClassName}>{value}</span>
        },
      })),
    [headers, formatters],
  )

  const [columnSizing, setColumnSizing] = useState({})
  const headerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const setHeaderRef = (id: string) => (el: HTMLDivElement | null) => {
    headerRefs.current[id] = el
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  })

  const measureHeadersAndSetSizing = useCallback(() => {
    const newSizing = Object.fromEntries(
      table.getAllColumns().map(col => [
        col.id,
        headerRefs.current[col.id]?.offsetWidth ?? 150,
      ]),
    )
    setColumnSizing(newSizing)
  }, [table])

  useLayoutEffect(() => {
    measureHeadersAndSetSizing()

    const debouncedMeasure = debounce(measureHeadersAndSetSizing, 50)

    window.addEventListener('resize', debouncedMeasure)
    return () => window.removeEventListener('resize', debouncedMeasure)
  }, [measureHeadersAndSetSizing])

  const tableContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={tableContainerRef} className='Layer__csv-upload__validate-csv-table__container'>
      <table className='Layer__table'>
        <thead className='Layer__csv-upload__validate-csv-table__thead'>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th ref={setHeaderRef(header.id)} key={header.id} className='Layer__table-header'>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <ValidateCsvTableBody table={table} tableContainerRef={tableContainerRef} />
      </table>
    </div>
  )
}

interface ValidateCsvTableBodyProps<T extends { [K in keyof T]: string | number }> {
  table: Table<PreviewRow<T>>
  tableContainerRef: React.RefObject<HTMLDivElement>
}

function ValidateCsvTableBody<T extends { [K in keyof T]: string | number }>({ table, tableContainerRef }: ValidateCsvTableBodyProps<T>) {
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 52,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== 'undefined'
      && navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  return (
    <tbody
      style={{ height: `${rowVirtualizer.getTotalSize() + 1}px` }}
      className='Layer__csv-upload__validate-csv-table__tbody'
    >
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
  )
}

interface ValidateCsvTableRowProps<T extends { [K in keyof T]: string | number }> {
  row: Row<PreviewRow<T>>
  virtualRow: VirtualItem
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
}

function ValidateCsvTableRow<T extends { [K in keyof T]: string | number }>({ row, virtualRow, rowVirtualizer }: ValidateCsvTableRowProps<T>) {
  return (
    <tr
      className='Layer__csv-upload__validate-csv-table__row Layer__table-row'
      data-index={virtualRow.index}
      ref={node => rowVirtualizer.measureElement(node)}
      key={row.id}
      style={{ transform: `translateY(${virtualRow.start}px)` }}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <td
            key={cell.id}
            className='Layer__csv-upload__validate-csv-table__cell Layer__table-cell'
            style={{ width: cell.column.getSize() }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
