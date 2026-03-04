import { TableCellAlign } from '@internal-types/table'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { SkeletonTableLoader } from '@components/SkeletonTableLoader/SkeletonTableLoader'
import { Table } from '@components/Table/Table'
import { TableCell } from '@components/TableCell/TableCell'
import { TableHead } from '@components/TableHead/TableHead'
import { TableRow } from '@components/TableRow/TableRow'

type ReportsTableLoaderProps = {
  typeColumnHeader?: string
  totalColumnHeader?: string
  showHeader?: boolean
}

export const ReportsTableLoader = ({
  typeColumnHeader = 'Type',
  totalColumnHeader = 'Total',
  showHeader = true,
}: ReportsTableLoaderProps) => {
  return (
    <Table borderCollapse='collapse'>
      {showHeader && (
        <TableHead>
          <TableRow rowKey='report-table-loader-header' isHeadRow>
            <TableCell isHeaderCell>{typeColumnHeader}</TableCell>
            <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
              {totalColumnHeader}
            </TableCell>
          </TableRow>
        </TableHead>
      )}
      <SkeletonTableLoader
        rows={6}
        cols={[
          { colSpan: 1, trimLastXRows: 4 },
          { colSpan: 1, parts: 2 },
        ]}
      />
    </Table>
  )
}

type ReportsTableErrorStateProps = {
  isLoading?: boolean
  onRefresh?: () => void
}

export const ReportsTableErrorState = ({
  isLoading,
  onRefresh,
}: ReportsTableErrorStateProps) => {
  return (
    <div className='Layer__table-state-container'>
      <DataState
        status={DataStateStatus.failed}
        title='Something went wrong'
        description='We couldn’t load your data.'
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
    </div>
  )
}
