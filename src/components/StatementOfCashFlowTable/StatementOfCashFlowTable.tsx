import { TableCell } from '@components/TableCell/TableCell'
import { TableRow } from '@components/TableRow/TableRow'
import { TableBody } from '@components/TableBody/TableBody'
import { TableHead } from '@components/TableHead/TableHead'
import { Table } from '@components/Table/Table'
import { Fragment, ReactNode } from 'react'
import { useTableExpandRow } from '@hooks/useTableExpandRow/useTableExpandRow'
import { StatementOfCashFlow } from '@internal-types/statement_of_cash_flow'
import { LineItem } from '@internal-types/line_item'
import { TableCellAlign } from '@internal-types/table'

type StatementOfCashFlowRowProps = {
  name: string
  displayName: string
  lineItem: string | undefined
  summarize: boolean
  type: string
}

export interface StatementOfCashFlowTableStringOverrides {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

export const StatementOfCashFlowTable = ({
  data,
  config,
  stringOverrides,
}: {
  data: StatementOfCashFlow
  config: StatementOfCashFlowRowProps[]
  stringOverrides?: StatementOfCashFlowTableStringOverrides
}) => {
  const { isOpen, setIsOpen } = useTableExpandRow()

  const renderLineItem = (
    lineItem: LineItem,
    depth: number = 0,
    rowKey: string,
    rowIndex: number,
  ): ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0
    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <Fragment key={rowKey + '-' + rowIndex}>
        <TableRow
          rowKey={rowKey + '-' + rowIndex}
          expandable={expandable}
          isExpanded={expanded}
          handleExpand={() => setIsOpen(rowKey)}
          depth={depth}
        >
          <TableCell withExpandIcon={expandable} primary={expandable}>
            {lineItem.display_name}
          </TableCell>
          <TableCell
            isCurrency={!expandable || (expandable && !expanded)}
            primary={expandable}
            align={TableCellAlign.RIGHT}
          >
            {(!expandable || (expandable && !expanded)) && lineItem.value}
          </TableCell>
        </TableRow>
        {expanded
          && lineItem.line_items
          && lineItem.line_items.map((subItem, subIdx) =>
            renderLineItem(
              subItem,
              depth + 1,
              rowKey + ':' + subItem.name,
              subIdx,
            ),
          )}
        {expanded && expandable && (
          <TableRow
            rowKey={rowKey + '-' + rowIndex + '--summation'}
            depth={depth + 1}
            variant='summation'
          >
            <TableCell primary>{`Total of ${lineItem.display_name}`}</TableCell>
            <TableCell primary isCurrency align={TableCellAlign.RIGHT}>
              {lineItem.value}
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow rowKey='soc-flow-head-row' isHeadRow>
          <TableCell isHeaderCell>
            {stringOverrides?.typeColumnHeader || 'Type'}
          </TableCell>
          <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
            {stringOverrides?.totalColumnHeader || 'Total'}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {config.map((row, idx) => {
          if (row.type === 'line_item') {
            return (
              <Fragment key={row.lineItem}>
                {data[row.lineItem as keyof StatementOfCashFlow]
                  && renderLineItem(
                    data[row.lineItem as keyof StatementOfCashFlow] as LineItem,
                    0,
                    row.lineItem ? row.lineItem : '',
                    idx,
                  )}
              </Fragment>
            )
          }
          else {
            return (
              <TableRow
                key={row.name + '-' + idx}
                rowKey={row.name + '-' + idx}
                variant='default'
              >
                <TableCell primary>{row.displayName}</TableCell>
                <TableCell primary isCurrency align={TableCellAlign.RIGHT}>
                  {data[row.lineItem as keyof StatementOfCashFlow] as number}
                </TableCell>
              </TableRow>
            )
          }
        })}
      </TableBody>
    </Table>
  )
}
