import { Fragment, useContext, useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { TableCellAlign } from '../../types/table'
import { Loader } from '../Loader'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { Table, TableBody, TableCell, TableRow } from '../Table'
import classNames from 'classnames'
import type { LineItem } from '../../utils/schema/utils'

export interface ProfitAndLossTableStringOverrides {
  grossProfitLabel?: string
  profitBeforeTaxesLabel?: string
  netProfitLabel?: string
}

export type ProfitAndLossTableProps = {
  lockExpanded?: boolean
  asContainer?: boolean
  stringOverrides?: ProfitAndLossTableStringOverrides
}

export const ProfitAndLossTableComponent = ({
  asContainer,
  stringOverrides,
}: ProfitAndLossTableProps) => {
  const { data, isLoading } = useContext(ProfitAndLoss.Context)

  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffect(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses', 'other_activity'])
  }, [])

  if (isLoading || !data) {
    return (
      <div
        className={classNames(
          'Layer__profit-and-loss-table__loader-container',
          asContainer && 'Layer__component-container',
        )}
      >
        <Loader />
      </div>
    )
  }

  const renderLineItem = ({
    lineItem,
    depth,
    rowKey,
    rowIndex,
    variant,
    showValue = true,
  }: {
    lineItem: Pick<LineItem, 'displayName' | 'value' | 'lineItems'>
    depth: number
    rowKey: string
    rowIndex: number
    variant?: 'default' | 'summation'
    showValue?: boolean
  }): React.ReactNode => {
    const expandable = lineItem.lineItems.length > 0

    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <Fragment key={rowKey + '-' + rowIndex}>
        <TableRow
          rowKey={rowKey + '-' + rowIndex}
          expandable={expandable}
          isExpanded={expanded}
          depth={depth}
          variant={variant ? variant : expandable ? 'expandable' : 'default'}
          handleExpand={() => setIsOpen(rowKey)}
        >
          <TableCell
            primary
            withExpandIcon={expandable}
          >
            {lineItem.displayName}
          </TableCell>
          {
            showValue
            && (
              <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
                {Number.isNaN(lineItem.value) ? 0 : lineItem.value}
              </TableCell>
            )
          }
        </TableRow>
        {expanded && lineItem.lineItems
          ? lineItem.lineItems.map((child, i) =>
            renderLineItem({
              lineItem: child,
              depth: depth + 1,
              rowKey: child.displayName + '-' + rowIndex,
              rowIndex: i,
            }),
          )
          : null}
      </Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse' bottomSpacing={false}>
      <TableBody>
        {renderLineItem({
          lineItem: data.income,
          depth: 0,
          rowKey: 'income',
          rowIndex: 0,
        })}

        {data.costOfGoodsSold
          && renderLineItem({
            lineItem: data.costOfGoodsSold,
            depth: 0,
            rowKey: 'cost_of_goods_sold',
            rowIndex: 1,
          })}
        {renderLineItem({
          lineItem: {
            value: data.grossProfit,
            displayName: stringOverrides?.grossProfitLabel || 'Gross Profit',
            lineItems: [],
          },
          depth: 0,
          rowKey: 'gross_profit',
          rowIndex: 2,
          variant: 'summation',
        })}
        {renderLineItem({
          lineItem: data.expenses,
          depth: 0,
          rowKey: 'expenses',
          rowIndex: 3,
        })}
        {renderLineItem({
          lineItem: {
            value: data.profitBeforeTaxes,
            displayName:
              stringOverrides?.profitBeforeTaxesLabel || 'Profit Before Taxes',
            lineItems: [],
          },
          depth: 0,
          rowKey: 'profit_before_taxes',
          rowIndex: 4,
          variant: 'summation',
        })}
        {renderLineItem({
          lineItem: data.taxes,
          depth: 0,
          rowKey: 'taxes',
          rowIndex: 5,
        })}
        {renderLineItem({
          lineItem: {
            value: data.netProfit,
            displayName: stringOverrides?.netProfitLabel || 'Net Profit',
            lineItems: [],
          },
          depth: 0,
          rowKey: 'net_profit',
          rowIndex: 6,
          variant: 'summation',
        })}
        {data.personalExpenses
          && renderLineItem({
            lineItem: data.personalExpenses,
            depth: 0,
            rowKey: 'personal_expenses',
            rowIndex: 7,
          })}
        {data.otherOutflows
          && renderLineItem({
            lineItem: data.otherOutflows,
            depth: 0,
            rowKey: 'other_outflows',
            rowIndex: 8,
          })}
        {data.customLineItems
          && renderLineItem({
            lineItem: data.customLineItems,
            depth: 0,
            rowKey: 'other_activity',
            rowIndex: 9,
            showValue: false,
          })}
      </TableBody>
    </Table>
  )
}
