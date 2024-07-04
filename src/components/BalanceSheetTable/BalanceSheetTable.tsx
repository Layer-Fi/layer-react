import React from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { BalanceSheet, LineItem } from '../../types'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'

type BalanceSheetRowProps = {
  name: string
  displayName: string
  lineItem: string
}

export const BalanceSheetTable = ({
  data,
  config,
}: {
  data: BalanceSheet
  config: BalanceSheetRowProps[]
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
          rowKey={rowKey + '-' + rowIndex}
          expandable={expandable}
          isExpanded={expanded}
          handleExpand={() => setIsOpen(rowKey)}
          depth={depth}
          withDivider={depth === 0 && rowIndex > 0}
        >
          <TableCell withExpandIcon={expandable} primary={expandable}>
            {lineItem.display_name}
          </TableCell>
          <TableCell
            isCurrency={!expandable || (expandable && !expanded)}
            primary={expandable}
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
          <TableRow
            rowKey={rowKey + '-' + rowIndex + '--summation'}
            depth={depth + 1}
            variant='summation'
          >
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
        <TableRow isHeadRow rowKey='balance-sheet-head-row'>
          <TableCell isHeaderCell>Type</TableCell>
          <TableCell isHeaderCell>Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {config.map((row, idx) => (
          <React.Fragment key={row.lineItem}>
            {data[row.lineItem as keyof BalanceSheet] &&
              renderLineItem(
                data[row.lineItem as keyof BalanceSheet] as LineItem,
                0,
                row.lineItem,
                idx,
              )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}
