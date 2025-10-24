import { useMemo } from 'react'
import { Loader } from '../Loader/Loader'
import {
  Table,
  TableHeader,
  TableBody,
  Column,
  Cell,
  Row,
} from '../ui/Table/Table'
import './dataTable.scss'

export type Column<TData, K> = {
  id: K
  header?: React.ReactNode
  cell: (row: TData) => React.ReactNode
  isRowHeader?: true
}

export type ColumnConfig<TData, TColumns extends string> = {
  [K in TColumns]: Column<TData, K>;
}

// DataTable has two type parameters - `TData` and `TColumns`
// Neither type is a subset of the other, and each is defined as follows:
// 1. `TData` is the shape of one row of data as it comes back from the API.
// 2. `TColumns` is the set of the columns that are displayed in the table. Not every field in `TData`
//  may have its own column, and there may be columns that are derived from multiple fields in `TData`.
// The relationship between `TColumns` and `TData` is that every column specified by`TColumn` has a
// `cell` render method in the `columnConfig` that takes a row of type `TData` and displays the cell.
export interface DataTableProps<TData, TColumns extends string> {
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
  hideHeader?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: readonly any[]
}

export const DataTable = <TData extends { id: string, depth?: number }, TColumns extends string>({
  columnConfig,
  data,
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  hideHeader,
  dependencies,
}: DataTableProps<TData, TColumns>) => {
  const columns: Column<TData, TColumns>[] = Object.values(columnConfig)
  const { EmptyState, ErrorState } = slots

  const isEmptyTable = data?.length === 0
  const renderTableBody = useMemo(() => {
    if (isError) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row'>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={columns.length}>
            <ErrorState />
          </Cell>
        </Row>
      )
    }

    if (isLoading) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row'>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={columns.length}>
            <Loader />
          </Cell>
        </Row>
      )
    }

    if (isEmptyTable) {
      return (
        <Row className='Layer__DataTable__EmptyState__Row'>
          <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={columns.length}>
            <EmptyState />
          </Cell>
        </Row>
      )
    }

    const RowRenderer = (row: TData) => (
      <Row key={row.id} depth={row?.depth}>
        {columns.map(col => (
          <Cell
            key={`${row.id}-${col.id}`}
            className={`Layer__UI__Table-Cell__${componentName}--${col.id}`}
          >
            {col.cell(row)}
          </Cell>
        ))}
      </Row>
    )
    RowRenderer.displayName = 'Row'
    return RowRenderer
  }, [isError, isLoading, isEmptyTable, columns, ErrorState, EmptyState, componentName])

  return (
    <Table aria-label={ariaLabel} className={`Layer__UI__Table__${componentName}`}>
      <TableHeader columns={columns} hideHeader={hideHeader}>
        {({ id, header, isRowHeader }) => (
          <Column key={id} isRowHeader={isRowHeader} className={`Layer__UI__Table-Column__${componentName}--${id}`}>
            {header}
          </Column>
        )}
      </TableHeader>
      <TableBody items={data} dependencies={dependencies}>
        {renderTableBody}
      </TableBody>
    </Table>
  )
}
