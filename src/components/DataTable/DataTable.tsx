import { useMemo } from 'react'
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

type ClickableRowProps<TData> = {
  onRowClick: (row: RowType<TData>) => void
  isRowClickable: (row: RowType<TData>) => boolean
}

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
  withClickableRow?: ClickableRowProps<TData>
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
  withClickableRow,
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
        {data?.map((row) => {
          const isClickable = withClickableRow?.isRowClickable(row)

          const onAction = isClickable && withClickableRow?.onRowClick
            ? () => withClickableRow.onRowClick(row)
            : undefined

          return (
            <Row
              key={row.id}
              depth={row.depth}
              nonAria={nonAria}
              onAction={onAction}
              className={isClickable ? 'Layer__DataTable__ClickableRow' : undefined}
            >
              {row.getVisibleCells().map(cell => (
                <Cell
                  key={`${row.id}-${cell.id}`}
                  className={`Layer__UI__Table-Cell__${componentName}--${cell.column.id}`}
                  nonAria={nonAria}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Cell>
              ))}
            </Row>
          )
        })}
      </>
    )
  }, [isError, isLoading, isEmptyTable, data, nonAria, numColumns, ErrorState, EmptyState, withClickableRow, componentName])

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
