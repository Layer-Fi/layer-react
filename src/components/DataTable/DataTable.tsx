import { useMemo } from 'react'
import { type HeaderGroup, type Row as RowType } from '@tanstack/react-table'

import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from '@ui/Table/Table'
import { flattenColumns, type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { Loader } from '@components/Loader/Loader'

import './dataTable.scss'

export interface DataTableProps<TData> {
  columnConfig: NestedColumnConfig<TData>
  data: RowType<TData>[] | undefined
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
  headerGroups: HeaderGroup<TData>[]
}

export const DataTable = <TData extends object>({
  columnConfig,
  data,
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  hideHeader,
  dependencies,
  headerGroups,
}: DataTableProps<TData>) => {
  const leafColumns = useMemo(() => flattenColumns(columnConfig), [columnConfig])
  const nonAria = headerGroups.length > 1

  const { EmptyState, ErrorState } = slots

  const isEmptyTable = data?.length === 0
  const renderTableBody = useMemo(() => {
    if (isError) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={leafColumns.length} nonAria={nonAria}>
            <ErrorState />
          </Cell>
        </Row>
      )
    }

    if (isLoading) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={leafColumns.length} nonAria={nonAria}>
            <Loader />
          </Cell>
        </Row>
      )
    }

    if (isEmptyTable) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={leafColumns.length} nonAria={nonAria}>
            <EmptyState />
          </Cell>
        </Row>
      )
    }

    return (
      <>
        {data?.map(row => (
          <Row key={row.id} depth={row.depth} nonAria={nonAria}>
            {leafColumns.map(col => (
              <Cell
                key={`${row.id}-${col.id}`}
                className={`Layer__UI__Table-Cell__${componentName}--${col.id}`}
                nonAria={nonAria}
              >
                {col.cell(row)}
              </Cell>
            ))}
          </Row>
        ))}
      </>
    )
  }, [isError, isLoading, isEmptyTable, data, nonAria, leafColumns, ErrorState, EmptyState, componentName])

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
