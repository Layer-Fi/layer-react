import { useTranslation } from 'react-i18next'

import { TableCellAlign } from '@internal-types/table'
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
  typeColumnHeader,
  totalColumnHeader,
  showHeader = true,
}: ReportsTableLoaderProps) => {
  const { t } = useTranslation()
  const typeColumnHeaderText = typeColumnHeader ?? t('common:label.type', 'Type')
  const totalColumnHeaderText = totalColumnHeader ?? t('common:label.total', 'Total')

  return (
    <Table borderCollapse='collapse'>
      {showHeader && (
        <TableHead>
          <TableRow rowKey='report-table-loader-header' isHeadRow>
            <TableCell isHeaderCell>{typeColumnHeaderText}</TableCell>
            <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
              {totalColumnHeaderText}
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
