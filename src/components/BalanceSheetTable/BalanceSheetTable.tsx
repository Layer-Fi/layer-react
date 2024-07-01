import React from 'react'
import { BalanceSheet, LineItem } from '../../types'
// import { LineItem } from '../../types/line_item'
// import { BalanceSheetRow } from '../BalanceSheetRow'
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
  console.log(data)

  const renderLineItem = (
    lineItem: LineItem,
    depth: number = 0,
  ): React.ReactNode => {
    const expanddable =
      lineItem.line_items && lineItem.line_items.length > 0 ? true : false
    return (
      <>
        <TableRow key={lineItem.name} expandable={expanddable} depth={depth}>
          <TableCell>{lineItem.display_name}</TableCell>
          <TableCell>{!expanddable && lineItem.value}</TableCell>
        </TableRow>
        {lineItem.line_items &&
          lineItem.line_items.length > 0 &&
          lineItem.line_items.map((subItem: LineItem) =>
            renderLineItem(subItem, depth + 1),
          )}
      </>
    )
  }

  return (
    <Table borderCollapse='collapse'>
      <TableHead>
        <TableRow>
          <TableCell key='balance-head-type' isHeaderCell={true}>
            Type
          </TableCell>
          <TableCell key='balance-head-total' isHeaderCell={true}>
            Total
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {config.map(row => (
          <>
            {data[row.lineItem as keyof BalanceSheet] !== undefined &&
              renderLineItem(
                data[row.lineItem as keyof BalanceSheet] as LineItem,
                0,
              )}
          </>
        ))}
      </TableBody>
    </Table>
  )
}
