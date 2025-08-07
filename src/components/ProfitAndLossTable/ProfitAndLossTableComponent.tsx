import { Fragment, useContext, useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { LineItem } from '../../types'
import { TableCellAlign } from '../../types/table'
import { Loader } from '../Loader'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { Table, TableBody, TableCell, TableRow } from '../Table'
import emptyPNL from './empty_profit_and_loss_report'
import classNames from 'classnames'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'

export interface ProfitAndLossTableStringOverrides {
  grossProfitLabel?: string
  profitBeforeTaxesLabel?: string
  netProfitLabel?: string
}

export type ProfitAndLossTableProps = {
  lockExpanded?: boolean
  asContainer?: boolean
  stringOverrides?: ProfitAndLossTableStringOverrides
  onLineItemClick?: (lineItemName: string, breadcrumbPath: BreadcrumbItem[]) => void
}

export const ProfitAndLossTableComponent = ({
  asContainer,
  stringOverrides,
  onLineItemClick,
}: ProfitAndLossTableProps) => {
  const {
    data: actualData,
    isLoading,
  } = useContext(ProfitAndLoss.Context)

  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffect(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses', 'other_activity'])
  }, [])

  const data = !actualData || isLoading ? emptyPNL : actualData

  if (isLoading || actualData === undefined) {
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
    parentBreadcrumbs = [],
  }: {
    lineItem: LineItem
    depth: number
    rowKey: string
    rowIndex: number
    variant?: 'default' | 'summation'
    showValue?: boolean
    parentBreadcrumbs?: BreadcrumbItem[]
  }): React.ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0
    const expanded = expandable ? isOpen(rowKey) : true
    
    // Build breadcrumb path for this line item
    const currentBreadcrumbs: BreadcrumbItem[] = [
      ...parentBreadcrumbs,
      { name: lineItem.name, display_name: lineItem.display_name }
    ]

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
            {lineItem.display_name}
          </TableCell>
          {
            showValue
            && (
              <TableCell
                isCurrency
                primary
                align={TableCellAlign.RIGHT}
                className={onLineItemClick && variant !== 'summation' ? 'Layer__profit-and-loss-table__clickable-cell' : undefined}
                onClick={onLineItemClick && variant !== 'summation' ? () => onLineItemClick(lineItem.name, currentBreadcrumbs) : undefined}
              >
                {Number.isNaN(lineItem.value) ? 0 : lineItem.value}
              </TableCell>
            )
          }
        </TableRow>
        {expanded && lineItem.line_items
          ? lineItem.line_items.map((child, i) =>
            renderLineItem({
              lineItem: child,
              depth: depth + 1,
              rowKey: child.display_name + '-' + rowIndex,
              rowIndex: i,
              parentBreadcrumbs: currentBreadcrumbs,
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

        {data.cost_of_goods_sold
          && renderLineItem({
            lineItem: data.cost_of_goods_sold,
            depth: 0,
            rowKey: 'cost_of_goods_sold',
            rowIndex: 1,
          })}
        {renderLineItem({
          lineItem: {
            name: 'gross_profit',
            value: data.gross_profit,
            display_name: stringOverrides?.grossProfitLabel || 'Gross Profit',
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
            name: 'profit_before_taxes',
            value: data.profit_before_taxes,
            display_name:
              stringOverrides?.profitBeforeTaxesLabel || 'Profit Before Taxes',
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
            name: 'net_profit',
            value: data.net_profit,
            display_name: stringOverrides?.netProfitLabel || 'Net Profit',
          },
          depth: 0,
          rowKey: 'net_profit',
          rowIndex: 6,
          variant: 'summation',
        })}
        {data.personal_expenses
          && renderLineItem({
            lineItem: data.personal_expenses,
            depth: 0,
            rowKey: 'personal_expenses',
            rowIndex: 7,
          })}
        {data.other_outflows
          && renderLineItem({
            lineItem: data.other_outflows,
            depth: 0,
            rowKey: 'other_outflows',
            rowIndex: 8,
          })}
        {data.custom_line_items
          && renderLineItem({
            lineItem: data.custom_line_items,
            depth: 0,
            rowKey: 'other_activity',
            rowIndex: 9,
            showValue: false,
          })}
      </TableBody>
    </Table>
  )
}
