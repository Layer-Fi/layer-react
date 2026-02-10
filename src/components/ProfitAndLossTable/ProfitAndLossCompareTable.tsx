import { Fragment, useContext, useEffect } from 'react'

import { type ProfitAndLossComparisonPnl } from '@internal-types/profit_and_loss'
import { type LineItemEncoded } from '@schemas/common/lineItem'
import {
  generateComparisonPeriods,
  getComparisonValue,
  mergeComparisonLineItemsAtDepth,
} from '@utils/profitAndLossComparisonUtils'
import { useBookkeepingPeriods } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useTableExpandRow } from '@hooks/useTableExpandRow/useTableExpandRow'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack } from '@ui/Stack/Stack'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { Loader } from '@components/Loader/Loader'
import { type ProfitAndLossTableStringOverrides } from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'
import { Table } from '@components/Table/Table'
import { TableBody } from '@components/TableBody/TableBody'
import { TableCell } from '@components/TableCell/TableCell'
import { TableHead } from '@components/TableHead/TableHead'
import { TableRow } from '@components/TableRow/TableRow'

interface ProfitAndLossCompareTableProps {
  stringOverrides?: ProfitAndLossTableStringOverrides
}

export const ProfitAndLossCompareTable = ({
  stringOverrides,
}: ProfitAndLossCompareTableProps) => {
  const { dateRange, dateSelectionMode } = useContext(ProfitAndLossContext)
  const {
    data: comparisonData,
    isLoading,
    comparePeriods,
    selectedCompareOptions,
    comparisonPeriodMode,
  } = useContext(ProfitAndLossComparisonContext)
  const { isOpen, setIsOpen } = useTableExpandRow()
  const { data: bookkeepingPeriods } = useBookkeepingPeriods()

  useEffect(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses'])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading || comparisonData === undefined) {
    return (
      <div className='Layer__profit-and-loss-table__loader-container'>
        <Loader />
      </div>
    )
  }

  const getBookkeepingPeriodStatus = (date: Date) => {
    if (!bookkeepingPeriods || dateSelectionMode !== 'month') {
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
    lineItem?: LineItemEncoded,
    data?: (string | number | LineItemEncoded)[],
  ): React.ReactNode => {
    const rowData: (string | number | boolean | LineItemEncoded | null | undefined)[] =
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
        rowData as LineItemEncoded[],
      )[0]

      lineItem = mergedLineItems && 'display_name' in mergedLineItems ? mergedLineItems : undefined
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
          <TableCell
            primary
            withExpandIcon={expandable}
            nowrap
            className='Layer__profit-and-loss-compare-table__sticky-cell'
          >
            {lineItem ? lineItem.display_name : rowDisplayName}
          </TableCell>
          {rowData.map((cell, i) => (
            <TableCell key={'compare-value' + i} isCurrency>
              {getComparisonValue(
                lineItem ? lineItem.display_name : rowDisplayName,
                depth,
                cell as string | number | LineItemEncoded,
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
              rowData as (string | number | LineItemEncoded)[],
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
            <TableCell
              isHeaderCell
              className='Layer__profit-and-loss-compare-table__sticky-cell'
            />
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
            <TableCell
              isHeaderCell
              className='Layer__profit-and-loss-compare-table__sticky-cell'
            />
            {selectedCompareOptions && selectedCompareOptions.length > 0
              ? (
                selectedCompareOptions.map((option, i) => (
                  <Fragment key={option.displayName + '-' + i}>
                    {generateComparisonPeriods({
                      numberOfPeriods: comparePeriods,
                      mode: comparisonPeriodMode,
                      ...dateRange,
                    }).map((month, index) => (
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
                  {generateComparisonPeriods({
                    numberOfPeriods: comparePeriods,
                    mode: comparisonPeriodMode,
                    ...dateRange,
                  }).map((month, index) => (
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
