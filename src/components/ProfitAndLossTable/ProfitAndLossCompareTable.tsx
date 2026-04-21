import { Fragment, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type ProfitAndLossComparisonItem,
  type ProfitAndLossComparisonPnl,
} from '@internal-types/profitAndLoss'
import { type LineItemEncoded } from '@schemas/common/lineItem'
import {
  generateComparisonPeriods,
  getComparisonValue,
  mergeComparisonLineItemsAtDepth,
} from '@utils/profitAndLossComparisonUtils'
import { useBookkeepingPeriods } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack } from '@ui/Stack/Stack'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { type ProfitAndLossTableStringOverrides } from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'
import { ReportsTableErrorState } from '@components/ReportsTableState/ReportsTableErrorState'
import { ReportsTableLoader } from '@components/ReportsTableState/ReportsTableLoader'
import { Table } from '@components/Table/Table'
import { TableBody } from '@components/TableBody/TableBody'
import { TableCell } from '@components/TableCell/TableCell'
import { TableHead } from '@components/TableHead/TableHead'
import { TableRow } from '@components/TableRow/TableRow'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

interface ProfitAndLossCompareTableProps {
  stringOverrides?: ProfitAndLossTableStringOverrides
}

export const ProfitAndLossCompareTable = ({
  stringOverrides,
}: ProfitAndLossCompareTableProps) => {
  const { t } = useTranslation()
  const formatter = useIntlFormatter()
  const { dateRange, dateSelectionMode } = useContext(ProfitAndLossContext)
  const {
    data: comparisonData,
    isLoading,
    isError,
    isValidating,
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

  const getBookkeepingPeriodStatus = (date: Date) => {
    if (!bookkeepingPeriods || dateSelectionMode !== 'month') {
      return
    }

    const currentMonth = date.getMonth() + 1
    const currentYear = date.getFullYear()

    const period = bookkeepingPeriods.find(
      period => period.year === currentYear && period.month === currentMonth,
    )

    if (!period) {
      return
    }

    return <BookkeepingStatus status={period.status} monthNumber={currentMonth} iconOnly />
  }

  const comparisonPeriods = useMemo(() => {
    if (!comparePeriods) {
      return []
    }

    return generateComparisonPeriods({
      numberOfPeriods: comparePeriods,
      mode: comparisonPeriodMode,
      ...dateRange,
    }, formatter)
  }, [comparePeriods, comparisonPeriodMode, dateRange, formatter])

  const renderRow = ({
    comparisonData,
    rowKey,
    depth,
    rowDisplayName,
    lineItem,
    data,
  }: {
    comparisonData: ProfitAndLossComparisonItem[]
    rowKey: string
    depth: number
    rowDisplayName: string
    lineItem?: LineItemEncoded
    data?: (string | number | LineItemEncoded)[]
  }): React.ReactNode => {
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
            renderRow({
              comparisonData,
              rowKey: child.display_name,
              depth: depth + 1,
              rowDisplayName: child.display_name,
              lineItem: child,
              data: rowData as (string | number | LineItemEncoded)[],
            }),
          )
          : null}
      </Fragment>
    )
  }

  return (
    <ConditionalBlock
      data={comparisonData}
      isLoading={isLoading}
      isError={isError}
      Loading={<ReportsTableLoader showHeader={false} />}
      Error={(
        <ReportsTableErrorState
          isLoading={isValidating}
        />
      )}
    >
      {({ data: resolvedComparisonData }) => (
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
                        {comparisonPeriods.map((period, index) => (
                          <TableCell key={option.displayName + '-' + index} isHeaderCell>
                            <HStack gap='2xs'>
                              {period.label}
                              {' '}
                              {getBookkeepingPeriodStatus(period.date)}
                            </HStack>
                          </TableCell>
                        ))}
                      </Fragment>
                    ))
                  )
                  : (
                    <Fragment key='total-1'>
                      {comparisonPeriods.map((period, index) => (
                        <TableCell key={'total-' + index + '-cell'} isHeaderCell>
                          {period.label}
                        </TableCell>
                      ))}
                    </Fragment>
                  )}
              </TableRow>
            )}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'income',
              depth: 0,
              rowDisplayName: t('reports:label.income', 'Income'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'cost_of_goods_sold',
              depth: 0,
              rowDisplayName: t('reports:label.cost_goods_sold', 'Cost of Goods Sold'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'gross_profit',
              depth: 0,
              rowDisplayName: stringOverrides?.grossProfitLabel || t('common:label.gross_profit', 'Gross Profit'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'expenses',
              depth: 0,
              rowDisplayName: t('common:label.expenses', 'Expenses'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'profit_before_taxes',
              depth: 0,
              rowDisplayName: stringOverrides?.netProfitLabel || t('reports:label.profit_before_taxes', 'Profit Before Taxes'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'taxes',
              depth: 0,
              rowDisplayName: t('common:label.taxes', 'Taxes'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'net_profit',
              depth: 0,
              rowDisplayName: stringOverrides?.netProfitLabel || t('reports:label.net_profit', 'Net Profit'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'personal_expenses',
              depth: 0,
              rowDisplayName: t('bankTransactions:label.personal_expenses', 'Personal Expenses'),
            })}
            {renderRow({
              comparisonData: resolvedComparisonData,
              rowKey: 'other_outflows',
              depth: 0,
              rowDisplayName: t('reports:label.other_outflows', 'Other Outflows'),
            })}
          </TableBody>
        </Table>
      )}
    </ConditionalBlock>
  )
}
