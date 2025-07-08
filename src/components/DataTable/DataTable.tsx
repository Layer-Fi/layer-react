import {
  Table,
  TableHeader,
  TableBody,
  Column,
  Cell,
  Row,
} from '../ui/Table/Table'

export type Column<TData, K> = {
  id: K
  header?: React.ReactNode
  cell: (row: TData) => React.ReactNode
  isRowHeader?: true
}

export type ColumnConfig<TData, TColumns extends string> = {
  [K in TColumns]: Column<TData, K>;
}

export interface DataTableProps<TData, TColumns extends string> {
  columnConfig: ColumnConfig<TData, TColumns>
  data: TData[]
  componentName: string
  ariaLabel?: string
}

export const DataTable = <TData extends { id: string }, TColumns extends string>({
  columnConfig,
  data,
  componentName,
  ariaLabel = 'Table',
}: DataTableProps<TData, TColumns>) => {
  const columns: Column<TData, TColumns>[] = Object.values(columnConfig)

  return (
    <Table aria-label={ariaLabel} className={`Layer__UI__Table__${componentName}`}>
      <TableHeader columns={columns}>
        {({ id, header, isRowHeader }) => (
          <Column key={id} isRowHeader={isRowHeader} className={`Layer__UI__Table-Column__${componentName}--${id}`}>
            {header}
          </Column>
        )}
      </TableHeader>
      <TableBody items={data}>
        {row => (
          <Row key={row.id}>
            {columns.map(col => (
              <Cell key={`${row.id}-${col.id}`} className={`Layer__UI__Table-Cell__${componentName}--${col.id}`}>
                {col.cell(row)}
              </Cell>
            ))}
          </Row>
        )}
      </TableBody>
    </Table>
  )
}
