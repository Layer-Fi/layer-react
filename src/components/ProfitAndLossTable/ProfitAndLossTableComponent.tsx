import { Fragment, useContext, useEffect } from 'react'
import { SidebarScope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import PieChart from '../../icons/PieChart'
import { LineItem } from '../../types'
import { TableCellAlign } from '../../types/table'
import { Loader } from '../Loader'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { Table, TableBody, TableCell, TableRow } from '../Table'
import emptyPNL from './empty_profit_and_loss_report'
import classNames from 'classnames'

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
  const {
    data: actualData,
    isLoading,
    setSidebarScope,
  } = useContext(ProfitAndLoss.Context)
  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffect(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses'])
  }, [])

  const currentData = Array.isArray(actualData)
    ? actualData[actualData.length - 1]
    : actualData
  const data = !currentData || isLoading ? emptyPNL : currentData

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

  const renderLineItem = (
    lineItem: LineItem,
    depth: number,
    rowKey: string,
    rowIndex: number,
    scope?: SidebarScope,
    setSidebarScope?: (view: SidebarScope) => void,
    variant?: 'default' | 'summation',
  ): React.ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0

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
            fullWidth={!!setSidebarScope}
          >
            {lineItem.display_name}
            {' '}
            {setSidebarScope && (
              <span
                className='Layer__profit-and-loss-row__detailed-chart-btn'
                onClick={(e) => {
                  e.stopPropagation()
                  setSidebarScope && setSidebarScope(scope ?? 'expenses')
                }}
              >
                <PieChart />
              </span>
            )}
          </TableCell>
          <TableCell isCurrency primary align={TableCellAlign.RIGHT}>
            {Number.isNaN(lineItem.value) ? 0 : lineItem.value}
          </TableCell>
        </TableRow>
        {expanded && lineItem.line_items
          ? lineItem.line_items.map((child, i) =>
            renderLineItem(
              child,
              depth + 1,
              child.display_name + '-' + rowIndex,
              i,
            ),
          )
          : null}
      </Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse' bottomSpacing={false}>
      <TableBody>
        {renderLineItem(
          data.income,
          0,
          'income',
          0,
          'revenue',
          setSidebarScope,
        )}
        {renderLineItem(
          data.cost_of_goods_sold,
          0,
          'cost_of_goods_sold',
          1,
          'expenses',
          setSidebarScope,
        )}
        {renderLineItem(
          {
            value: data.gross_profit,
            display_name: stringOverrides?.grossProfitLabel || 'Gross Profit',
          },
          0,
          'gross_profit',
          2,
          undefined,
          undefined,
          'summation',
        )}
        {renderLineItem(
          data.expenses,
          0,
          'expenses',
          3,
          'expenses',
          setSidebarScope,
        )}
        {renderLineItem(
          {
            value: data.profit_before_taxes,
            display_name:
              stringOverrides?.profitBeforeTaxesLabel || 'Profit Before Taxes',
          },
          0,
          'profit_before_taxes',
          4,
          undefined,
          undefined,
          'summation',
        )}
        {renderLineItem(
          data.taxes,
          0,
          'taxes',
          5,
          'expenses',
        )}
        {renderLineItem(
          {
            value: data.net_profit,
            display_name: stringOverrides?.netProfitLabel || 'Net Profit',
          },
          0,
          'net_profit',
          5,
          undefined,
          undefined,
          'summation',
        )}
        {data.personal_expenses
          ? renderLineItem(data.personal_expenses, 0, 'personal_expenses', 7)
          : null}
        {data.other_outflows
          ? renderLineItem(data.other_outflows, 0, 'other_outflows', 6)
          : null}
      </TableBody>
    </Table>
  )
}
