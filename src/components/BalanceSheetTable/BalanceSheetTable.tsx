import React, { useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { BalanceSheet, LineItem } from '../../types'
import { TableCellAlign } from '../../types/table'
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table'

export interface BalanceSheetTableStringOverrides {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

type BalanceSheetRowProps = {
  name: string
  displayName: string
  lineItem: string
}

export const BalanceSheetTable = ({
  data,
  config,
  stringOverrides,
}: {
  data: BalanceSheet
  config: BalanceSheetRowProps[]
  stringOverrides?: BalanceSheetTableStringOverrides
}) => {
  const { isOpen, setIsOpen, expandedAllRows } = useTableExpandRow()
  const allRowKeys: string[] = []

  useEffect(() => {
    if (expandedAllRows) {
      setIsOpen(allRowKeys, true)
    }
  }, [expandedAllRows])

  useEffect(() => {
    setIsOpen(['assets'])
  }, [])

  const renderLineItem = (
    lineItem: LineItem,
    depth: number = 0,
    rowKey: string,
    rowIndex: number,
  ): React.ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0

    const expanded = expandable ? isOpen(rowKey) : true

    const showChildren = expanded || expandedAllRows

    if (expandable) {
      allRowKeys.push(rowKey)
    }

    return (
      <React.Fragment key={rowKey + '-' + rowIndex}>
        <TableRow
          rowKey={rowKey + '-' + rowIndex}
          expandable={expandable}
          isExpanded={showChildren}
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
            align={TableCellAlign.RIGHT}
          >
            {(!expandable || (expandable && !expanded)) && lineItem.value}
          </TableCell>
        </TableRow>
        {showChildren
        && lineItem.line_items
        && lineItem.line_items.map((subItem, subIdx) =>
          renderLineItem(
            subItem,
            depth + 1,
            rowKey + ':' + subItem.name,
            subIdx,
          ),
        )}
        {showChildren && expandable && (
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
      </React.Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow isHeadRow rowKey='balance-sheet-head-row'>
          <TableCell isHeaderCell>
            {stringOverrides?.typeColumnHeader || 'Type'}
          </TableCell>
          <TableCell isHeaderCell align={TableCellAlign.RIGHT}>
            {stringOverrides?.totalColumnHeader || 'Total'}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {config.map((row, idx) => (
          <React.Fragment key={row.lineItem}>
            {data[row.lineItem as keyof BalanceSheet]
            && renderLineItem(
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
