import React, { useContext, useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { LineItem } from '../../types'
import { ProfitAndLossComparisonPnl } from '../../types/profit_and_loss'
import { Loader } from '../Loader'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'
import { Table, TableBody, TableHead, TableRow, TableCell } from '../Table'
import { ProfitAndLossTableStringOverrides } from './ProfitAndLossTableComponent'
import emptyPNL from './empty_profit_and_loss_report'
import classNames from 'classnames'
import { format, subMonths } from 'date-fns'

interface ProfilAndLostCompareTableProps {
  stringOverrides?: ProfitAndLossTableStringOverrides
}

export const ProfitAndLossCompareTable = ({
  stringOverrides,
}: ProfilAndLostCompareTableProps) => {
  const {
    data: actualData,
    isLoading,
    dateRange,
  } = useContext(ProfitAndLoss.Context)
  const {
    data: comparisonData,
    isLoading: comparisonIsLoading,
    compareMonths,
    compareOptions,
  } = useContext(ProfitAndLoss.ComparisonContext)
  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffect(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses'])
  }, [])

  const currentData = Array.isArray(actualData)
    ? actualData[actualData.length - 1]
    : actualData
  const data = !currentData || isLoading ? emptyPNL : currentData

  if (comparisonIsLoading || isLoading || actualData === undefined) {
    return (
      <div
        className={classNames('Layer__profit-and-loss-table__loader-container')}
      >
        <Loader />
      </div>
    )
  }

  const generateMonths = (startDate: number | Date, numberOfMonths: number) => {
    return Array.from({ length: numberOfMonths }, (_, index) => {
      const currentMonth = subMonths(startDate, numberOfMonths - index - 1)
      return format(currentMonth, 'MMM')
    })
  }

  const getCompareValue = (
    option: string,
    rowKey: string,
    monthIndex: number,
    depth: number,
  ) => {
    if (!comparisonData || comparisonData.length === 0) {
      return 0
    } else {
      const filterData = comparisonData.filter(item =>
        option === 'Total'
          ? item.tag_filter === null
          : item.tag_filter?.values.includes(option.toLowerCase()),
      )

      if (filterData.length === 0) {
        return 0
      }

      let foundValue

      if (rowKey in filterData[monthIndex].pnl) {
        if (depth === 0) {
          foundValue =
            filterData[monthIndex].pnl[
              rowKey as keyof ProfitAndLossComparisonPnl
            ]
          if (
            typeof foundValue === 'number' ||
            typeof foundValue === 'string'
          ) {
            return foundValue
          } else if (
            typeof foundValue === 'object' &&
            foundValue &&
            'line_items' in foundValue
          ) {
            return foundValue.value
          }
        }
      }

      return 0
    }
  }

  const renderLineItem = (
    lineItem: LineItem,
    depth: number,
    rowKey: string,
    rowIndex: number,
    variant?: 'default' | 'summation',
  ): React.ReactNode => {
    const expandable = !!lineItem.line_items && lineItem.line_items.length > 0

    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <React.Fragment key={rowKey + '-' + rowIndex}>
        <TableRow
          rowKey={rowKey + '-' + rowIndex}
          expandable={expandable}
          isExpanded={expanded}
          depth={depth}
          variant={variant ? variant : expandable ? 'expandable' : 'default'}
          handleExpand={() => setIsOpen(rowKey)}
        >
          <TableCell primary withExpandIcon={expandable}>
            {lineItem.display_name}
          </TableCell>
          {compareOptions && compareOptions.length > 0 ? (
            compareOptions.map((option, i) => (
              <React.Fragment key={option + '-' + i}>
                {compareMonths &&
                  Array.from({ length: compareMonths }, (_, index) => (
                    <TableCell
                      key={'compare-value-' + index + '-' + i}
                      isCurrency
                    >
                      {getCompareValue(option, rowKey, index, depth)}
                    </TableCell>
                  ))}
              </React.Fragment>
            ))
          ) : (
            <React.Fragment key={'compare-values'}>
              {compareMonths &&
                Array.from({ length: compareMonths }, (_, index) => (
                  <TableCell key={'compare-value-' + index + '-'} isCurrency>
                    {/* {getCompareValue()} */}
                  </TableCell>
                ))}
            </React.Fragment>
          )}
        </TableRow>
        {expanded && lineItem.line_items
          ? lineItem.line_items.map((child, i) =>
              renderLineItem(child, depth + 1, child.display_name, i),
            )
          : null}
      </React.Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse' bottomSpacing={false}>
      <TableHead>
        {compareOptions && compareOptions.length > 0 && (
          <TableRow rowKey=''>
            <TableCell isHeaderCell />
            {compareOptions.map((option, i) => (
              <React.Fragment key={option + '-' + i}>
                <TableCell key={option + '-' + i} primary isHeaderCell>
                  {option}
                </TableCell>
                {compareMonths &&
                  Array.from({ length: compareMonths - 1 }, (_, index) => (
                    <TableCell key={option + '-' + index} isHeaderCell />
                  ))}
              </React.Fragment>
            ))}
          </TableRow>
        )}
      </TableHead>
      <TableBody>
        {compareMonths && (
          <TableRow rowKey=''>
            <TableCell isHeaderCell />
            {compareOptions && compareOptions.length > 0 ? (
              compareOptions.map((option, i) => (
                <React.Fragment key={option + '-' + i}>
                  {generateMonths(dateRange.startDate, compareMonths).map(
                    (month: string, index: number) => (
                      <TableCell key={option + '-' + index} isHeaderCell>
                        {month}
                      </TableCell>
                    ),
                  )}
                </React.Fragment>
              ))
            ) : (
              <React.Fragment key={'total-1'}>
                {generateMonths(dateRange.startDate, compareMonths).map(
                  (month: string, index: number) => (
                    <TableCell key={'total-' + index + '-cell'} isHeaderCell>
                      {month}
                    </TableCell>
                  ),
                )}
              </React.Fragment>
            )}
          </TableRow>
        )}
        {renderLineItem(data.income, 0, 'income', 0)}
        {renderLineItem(data.cost_of_goods_sold, 0, 'cost_of_goods_sold', 1)}
        {renderLineItem(
          {
            value: data.gross_profit,
            display_name: stringOverrides?.grossProfitLabel || 'Gross Profit',
          },
          0,
          'gross_profit',
          2,
          'summation',
        )}
        {renderLineItem(data.expenses, 0, 'expenses', 3)}
        {renderLineItem(
          {
            value: data.profit_before_taxes,
            display_name:
              stringOverrides?.profitBeforeTaxesLabel || 'Profit Before Taxes',
          },
          0,
          'profit_before_taxes',
          4,
          'summation',
        )}
        {renderLineItem(data.taxes, 0, 'taxes', 5)}
        {renderLineItem(
          {
            value: data.net_profit,
            display_name: stringOverrides?.netProfitLabel || 'Net Profit',
          },
          0,
          'net_profit',
          5,
          'summation',
        )}
        {data.personal_expenses ? (
          <React.Fragment>
            {renderLineItem(data.personal_expenses, 0, 'personal_expenses', 7)}
          </React.Fragment>
        ) : null}
        {data.other_outflows ? (
          <React.Fragment>
            {renderLineItem(data.other_outflows, 0, 'other_outflows', 6)}
          </React.Fragment>
        ) : null}
      </TableBody>
    </Table>
  )
}
