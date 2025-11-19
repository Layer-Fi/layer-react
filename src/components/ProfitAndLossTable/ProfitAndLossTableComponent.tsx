import { Fragment, useContext } from 'react'
import classNames from 'classnames'

import { TableCellAlign } from '@internal-types/table'
import type { LineItem } from '@schemas/common/lineItem'
import { useEffectOnMount } from '@hooks/useEffectOnMount/useEffectOnMount'
import { useTableExpandRow } from '@hooks/useTableExpandRow/useTableExpandRow'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { Button } from '@ui/Button/Button'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { type BreadcrumbItem } from '@components/DetailReportBreadcrumb/DetailReportBreadcrumb'
import { Loader } from '@components/Loader/Loader'
import { Table } from '@components/Table/Table'
import { TableBody } from '@components/TableBody/TableBody'
import { TableCell } from '@components/TableCell/TableCell'
import { TableRow } from '@components/TableRow/TableRow'

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
  const { data, isLoading } = useContext(ProfitAndLossContext)

  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffectOnMount(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses', 'other_activity'])
  })

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
    parentBreadcrumbs = [],
  }: {
    lineItem: Pick<LineItem, 'name' | 'displayName' | 'value' | 'lineItems'>
    depth: number
    rowKey: string
    rowIndex: number
    variant?: 'default' | 'summation'
    showValue?: boolean
    parentBreadcrumbs?: BreadcrumbItem[]
  }): React.ReactNode => {
    const expandable = lineItem.lineItems.length > 0

    const expanded = expandable ? isOpen(rowKey) : true

    const currentBreadcrumbs: BreadcrumbItem[] = [
      ...parentBreadcrumbs,
      { name: lineItem.name, display_name: lineItem.displayName },
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
            {lineItem.displayName}
          </TableCell>
          {
            showValue
            && (
              <TableCell
                isCurrency={variant === 'summation' || !onLineItemClick}
                primary
                align={TableCellAlign.RIGHT}
              >
                {variant === 'summation' || !onLineItemClick
                  ? (
                    Number.isNaN(lineItem.value) ? 0 : lineItem.value
                  )
                  : (
                    <Button
                      variant='text'
                      onPress={() => onLineItemClick(lineItem.name, currentBreadcrumbs)}
                    >
                      <MoneySpan bold amount={lineItem.value ?? 0} />
                    </Button>
                  )}
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

        {data.costOfGoodsSold
          && renderLineItem({
            lineItem: data.costOfGoodsSold,
            depth: 0,
            rowKey: 'cost_of_goods_sold',
            rowIndex: 1,
            variant: 'summation',
          })}
        {renderLineItem({
          lineItem: {
            name: 'gross_profit',
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
            name: 'profit_before_taxes',
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
            name: 'net_profit',
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
          && data.customLineItems.map((customLineItem, index) =>
            renderLineItem({
              lineItem: customLineItem,
              depth: 0,
              rowKey: `custom_line_item_${index}`,
              rowIndex: 9 + index,
              showValue: false,
            }),
          )}
      </TableBody>
    </Table>
  )
}
