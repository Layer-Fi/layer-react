import { Fragment, useContext, useEffect } from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { LineItem } from '../../types'
import { ProfitAndLossComparisonPnl } from '../../types/profit_and_loss'
import {
  generateComparisonPeriods,
  getComparisonValue,
  mergeComparisonLineItemsAtDepth,
} from '../../utils/profitAndLossComparisonUtils'
import { Loader } from '../Loader'
import { ProfitAndLoss } from '../ProfitAndLoss/ProfitAndLoss'
import { Table, TableBody, TableHead, TableRow, TableCell } from '../Table'
import { ProfitAndLossTableStringOverrides } from './ProfitAndLossTableComponent'
import classNames from 'classnames'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import { HStack } from '../ui/Stack/Stack'

interface ProfilAndLostCompareTableProps {
  stringOverrides?: ProfitAndLossTableStringOverrides
}

export const ProfitAndLossCompareTable = ({
  stringOverrides,
}: ProfilAndLostCompareTableProps) => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const {
    data: comparisonData,
    isLoading,
    comparePeriods,
    selectedCompareOptions,
  } = useContext(ProfitAndLoss.ComparisonContext)
  const { isOpen, setIsOpen } = useTableExpandRow()
  const { rangeDisplayMode } = useGlobalDateRange()
  const { data: bookkeepingPeriods } = useBookkeepingPeriods()

  useEffect(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses'])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading || comparisonData === undefined) {
    return (
      <div
        className={classNames('Layer__profit-and-loss-table__loader-container')}
      >
        <Loader />
      </div>
    )
  }

  const getBookkeepingPeriodStatus = (date: Date) => {
    if (!bookkeepingPeriods || rangeDisplayMode !== 'monthPicker') {
      return
    }

    const currentMonth = date.getMonth() + 1
    const currentYear = date.getFullYear()

    const period = bookkeepingPeriods?.find(
      period => period.year === currentYear && period.month === currentMonth,
    )

    if (!period) {
      return
    }

    return <BookkeepingStatus status={period.status} monthNumber={currentMonth} iconOnly />
  }

  const renderRow = (
    rowKey: string,
    depth: number,
    rowDisplayName: string,
    lineItem?: LineItem,
    data?: (string | number | LineItem)[],
  ): React.ReactNode => {
    const rowData: (string | number | boolean | LineItem | null | undefined)[] =
      data ? data : []

    if (!lineItem) {
      comparisonData.forEach((item) => {
        if (
          rowKey in item.pnl
          && item.pnl[rowKey as keyof ProfitAndLossComparisonPnl] !== null
        ) {
          rowData.push(item.pnl[rowKey as keyof ProfitAndLossComparisonPnl])
        }
      })

      if (rowData.length === 0) {
        return <></>
      }

      const mergedLineItems = mergeComparisonLineItemsAtDepth(
        rowData as LineItem[],
      )[0]

      lineItem = 'display_name' in mergedLineItems ? mergedLineItems : undefined
    }

    const expandable =
      lineItem?.line_items && lineItem.line_items.length > 0 ? true : false
    const expanded = expandable ? isOpen(rowKey) : true

    return (
      <Fragment key={rowKey}>
        <TableRow
          rowKey={rowKey}
          expandable={expandable}
          isExpanded={expanded}
          depth={depth}
          variant={expandable ? 'expandable' : 'default'}
          handleExpand={() => setIsOpen(rowKey)}
        >
          <TableCell primary withExpandIcon={expandable}>
            {lineItem ? lineItem.display_name : rowDisplayName}
          </TableCell>
          {rowData.map((cell, i) => (
            <TableCell key={'compare-value' + i} isCurrency>
              {getComparisonValue(
                lineItem ? lineItem.display_name : rowDisplayName,
                depth,
                cell as string | number | LineItem,
              )}
            </TableCell>
          ))}
        </TableRow>
        {expanded && lineItem?.line_items
          ? lineItem.line_items.map(child =>
            renderRow(
              child.display_name,
              depth + 1,
              child.display_name,
              child,
              rowData as (string | number | LineItem)[],
            ),
          )
          : null}
      </Fragment>
    )
  }

  return (
    <Table borderCollapse='collapse' bottomSpacing={false}>
      <TableHead>
        {selectedCompareOptions && selectedCompareOptions.length > 1 && (
          <TableRow rowKey=''>
            <TableCell isHeaderCell />
            {selectedCompareOptions.map((option, i) => (
              <Fragment key={option.displayName + '-' + i}>
                <TableCell key={option.displayName + '-' + i} primary isHeaderCell>
                  {option.displayName}
                </TableCell>
                {comparePeriods
                && Array.from({ length: comparePeriods - 1 }, (_, index) => (
                  <TableCell key={option.displayName + '-' + index} isHeaderCell />
                ))}
              </Fragment>
            ))}
          </TableRow>
        )}
      </TableHead>
      <TableBody>
        {comparePeriods && (
          <TableRow rowKey=''>
            <TableCell isHeaderCell />
            {selectedCompareOptions && selectedCompareOptions.length > 0
              ? (
                selectedCompareOptions.map((option, i) => (
                  <Fragment key={option.displayName + '-' + i}>
                    {generateComparisonPeriods(
                      dateRange.startDate,
                      comparePeriods,
                      rangeDisplayMode,
                    ).map((month, index) => (
                      <TableCell key={option.displayName + '-' + index} isHeaderCell>
                        <HStack gap='2xs'>
                          {month.label}
                          {' '}
                          {getBookkeepingPeriodStatus(month.date)}
                        </HStack>
                      </TableCell>
                    ))}
                  </Fragment>
                ))
              )
              : (
                <Fragment key='total-1'>
                  {generateComparisonPeriods(
                    dateRange.startDate,
                    comparePeriods,
                    rangeDisplayMode,
                  ).map((month, index) => (
                    <TableCell key={'total-' + index + '-cell'} isHeaderCell>
                      {month.label}
                    </TableCell>
                  ))}
                </Fragment>
              )}
          </TableRow>
        )}
        {renderRow('income', 0, 'Income')}
        {renderRow('cost_of_goods_sold', 0, 'Cost of Goods Sold')}
        {renderRow(
          'gross_profit',
          0,
          stringOverrides?.grossProfitLabel || 'Gross Profit',
        )}
        {renderRow('expenses', 0, 'Expenses')}
        {renderRow(
          'profit_before_taxes',
          0,
          stringOverrides?.netProfitLabel || 'Profit Before Taxes',
        )}
        {renderRow('taxes', 0, 'Taxes')}
        {renderRow(
          'net_profit',
          0,
          stringOverrides?.netProfitLabel || 'Net Profit',
        )}
        {renderRow('personal_expenses', 0, 'Personal Expenses')}
        {renderRow('other_outflows', 0, 'Other Outflows')}
      </TableBody>
    </Table>
  )
}
