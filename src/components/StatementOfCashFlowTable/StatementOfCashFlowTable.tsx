import React from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { BalanceSheet, StatementOfCashFlow } from '../../types'
import { LineItem } from '../../types/line_item'
import { Table, TableHead, TableBody, TableRow, TableCell } from '../Table'

type StatementOfCashFlowRowProps = {
  name: string
  displayName: string
  lineItem: string | undefined
  summarize: boolean
  type: string
}

export const StatementOfCashFlowTable = ({
  data,
  config,
}: {
  data: StatementOfCashFlow
  config: StatementOfCashFlowRowProps[]
}) => {
  const { isOpen, setIsOpen } = useTableExpandRow()

  const renderLineItem = (
    lineItem: LineItem,
    depth: number = 0,
    rowKey: string,
    rowIndex: number,
  ): React.ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0
    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <React.Fragment key={rowKey + '-' + rowIndex}>
        <TableRow
          expandable={expandable}
          isExpanded={expanded}
          handleExpand={() => setIsOpen(rowKey)}
          depth={depth}
          withDivider={depth === 0 && rowIndex > 0}
        >
          <TableCell
            withExpandIcon={expandable}
            primary={expandable && !expanded}
          >
            {lineItem.display_name}
          </TableCell>
          <TableCell
            isCurrency={!expandable || (expandable && !expanded)}
            primary={expandable && !expanded}
          >
            {(!expandable || (expandable && !expanded)) && lineItem.value}
          </TableCell>
        </TableRow>
        {expanded &&
          lineItem.line_items &&
          lineItem.line_items.map((subItem, subIdx) =>
            renderLineItem(
              subItem,
              depth + 1,
              rowKey + ':' + subItem.name,
              subIdx,
            ),
          )}
        {expanded && expandable && (
          <TableRow depth={depth + 1} variant='summation'>
            <TableCell primary>{`Total of ${lineItem.display_name}`}</TableCell>
            <TableCell primary isCurrency>
              {lineItem.value}
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow isHeadRow>
          <TableCell isHeaderCell>Type</TableCell>
          <TableCell isHeaderCell>Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {config.map((row, idx) => {
          if (row.type === 'line_item') {
            return (
              <React.Fragment key={row.lineItem}>
                {data[row.lineItem as keyof StatementOfCashFlow] &&
                  renderLineItem(
                    data[row.lineItem as keyof StatementOfCashFlow] as LineItem,
                    0,
                    row.lineItem ? row.lineItem : '',
                    idx,
                  )}
              </React.Fragment>
            )
          } else {
            return (
              <TableRow key={row.name} variant='default' withDivider>
                <TableCell primary>{row.displayName}</TableCell>
                <TableCell primary isCurrency>
                  {row.lineItem}
                </TableCell>
              </TableRow>
            )
          }
        })}
      </TableBody>
    </Table>
  )
}
