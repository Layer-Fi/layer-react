import { useMemo } from 'react'
import type { PressEvent } from '@react-types/shared'
import { flexRender, type HeaderGroup, type Row as RowType } from '@tanstack/react-table'

import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from '@ui/Table/Table'
import { Loader } from '@components/Loader/Loader'

import './dataTable.scss'

export interface BaseDataTableProps {
  componentName: string
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  hideHeader?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: readonly any[]
}

export interface DataTableProps<TData> extends BaseDataTableProps {
  data: RowType<TData>[] | undefined
  headerGroups: HeaderGroup<TData>[]
  numColumns: number
  isRowClickable?: (row: RowType<TData>) => boolean
  onRowClick?: (row: RowType<TData>, event?: PressEvent | React.MouseEvent) => void
}

export const DataTable = <TData extends object>({
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  hideHeader,
  dependencies,
  data,
  headerGroups,
  numColumns,
  isRowClickable,
  onRowClick,
}: DataTableProps<TData>) => {
  const nonAria = headerGroups.length > 1

  const { EmptyState, ErrorState } = slots

  const isEmptyTable = data?.length === 0
  const renderTableBody = useMemo(() => {
    if (isError) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={numColumns} nonAria={nonAria}>
            <ErrorState />
          </Cell>
        </Row>
      )
    }

    if (isLoading) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={numColumns} nonAria={nonAria}>
            <Loader />
          </Cell>
        </Row>
      )
    }

    if (isEmptyTable) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={numColumns} nonAria={nonAria}>
            <EmptyState />
          </Cell>
        </Row>
      )
    }

    return (
      <>
        {data?.map(row => (
          <Row
            key={row.id}
            depth={row.depth}
            nonAria={nonAria}
            className={isRowClickable?.(row) ? 'Layer__DataTable__ClickableRow' : undefined}
            onClick={nonAria && onRowClick ? event => onRowClick(row, event) : undefined}
          >
            {row.getVisibleCells().map(cell => (
              <Cell
                key={`${row.id}-${cell.id}`}
                className={`Layer__UI__Table-Cell__${componentName}--${cell.column.id}`}
                nonAria={nonAria}
                onClick={!nonAria && onRowClick && isRowClickable?.(row)
                  ? event => onRowClick(row, event)
                  : undefined}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Cell>
            ))}
          </Row>
        ))}
      </>
    )
  }, [isError, isLoading, isEmptyTable, data, nonAria, numColumns, ErrorState, EmptyState, componentName, isRowClickable, onRowClick])

  return (
    <Table aria-label={ariaLabel} className={`Layer__UI__Table__${componentName}`} nonAria={nonAria}>
      <TableHeader hideHeader={hideHeader} nonAria={nonAria}>
        {headerGroups.map(headerGroup => (
          <Row key={headerGroup.id} nonAria={nonAria}>
            {headerGroup.headers.map(header => (
              <Column
                key={header.id}
                isRowHeader={header.column.columnDef.meta?.isRowHeader}
                className={`Layer__UI__Table-Column__${componentName}--${header.id}`}
                nonAria={nonAria}
                colSpan={header.colSpan}
              >
                {header.isPlaceholder
                  ? null
                  : (typeof header.column.columnDef.header === 'function'
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header)}
              </Column>
            ))}
          </Row>
        ))}
      </TableHeader>
      <TableBody dependencies={dependencies} nonAria={nonAria}>
        {renderTableBody}
      </TableBody>
    </Table>
  )
}
