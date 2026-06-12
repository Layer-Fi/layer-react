import { Fragment, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type ProfitAndLossComparisonItem,
  type ProfitAndLossComparisonPnl,
} from '@internal-types/profitAndLoss'
import { type LineItemEncoded } from '@schemas/common/lineItem'
import { Alignment } from '@schemas/reports/unifiedReport'
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
import { Column, Row, TableHeader } from '@ui/Table/Table'
import { Span } from '@ui/Typography/Text'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { type ProfitAndLossTableStringOverrides } from '@components/ProfitAndLossTable/ProfitAndLossTableComponent'
import {
  ReportsTable,
  ReportsTableAmountCell,
  ReportsTableBody,
  ReportsTableNameCell,
  ReportsTableRow,
} from '@components/ReportsTable/ReportsTable'
import { ReportsTableErrorState } from '@components/ReportsTableState/ReportsTableErrorState'
import { ReportsTableLoader } from '@components/ReportsTableState/ReportsTableLoader'
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
    const displayName = lineItem ? lineItem.display_name : rowDisplayName

    return (
      <Fragment key={rowKey}>
        <ReportsTableRow
          depth={depth}
          expandable={expandable}
          onExpand={expandable ? () => setIsOpen(rowKey) : undefined}
        >
          <ReportsTableNameCell
            expandable={expandable}
            expanded={expanded}
            bold
            className='Layer__profit-and-loss-compare-table__sticky-cell'
          >
            {displayName}
          </ReportsTableNameCell>
          {rowData.map((cell, i) => {
            const comparisonValue = getComparisonValue(
              displayName,
              depth,
              cell as string | number | LineItemEncoded,
            )

            return (
              <ReportsTableAmountCell
                key={'compare-value' + i}
                amount={typeof comparisonValue === 'number' ? comparisonValue : 0}
                alignment={Alignment.Left}
              />
            )
          })}
        </ReportsTableRow>
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
        <ReportsTable bottomSpacing={false}>
          <TableHeader nonAria>
            {selectedCompareOptions && selectedCompareOptions.length > 1 && (
              <Row nonAria>
                <Column
                  nonAria
                  className='Layer__profit-and-loss-compare-table__sticky-cell'
                />
                {selectedCompareOptions.map((option, i) => (
                  <Fragment key={option.displayName + '-' + i}>
                    <Column key={option.displayName + '-' + i} nonAria>
                      <Span weight='bold'>{option.displayName}</Span>
                    </Column>
                    {comparePeriods
                      && Array.from({ length: comparePeriods - 1 }, (_, index) => (
                        <Column key={option.displayName + '-' + index} nonAria />
                      ))}
                  </Fragment>
                ))}
              </Row>
            )}
          </TableHeader>
          <ReportsTableBody>
            {comparePeriods && (
              <Row nonAria>
                <Column
                  nonAria
                  className='Layer__profit-and-loss-compare-table__sticky-cell'
                />
                {selectedCompareOptions && selectedCompareOptions.length > 0
                  ? (
                    selectedCompareOptions.map((option, i) => (
                      <Fragment key={option.displayName + '-' + i}>
                        {comparisonPeriods.map((period, index) => (
                          <Column key={option.displayName + '-' + index} nonAria>
                            <HStack gap='2xs'>
                              {period.label}
                              {' '}
                              {getBookkeepingPeriodStatus(period.date)}
                            </HStack>
                          </Column>
                        ))}
                      </Fragment>
                    ))
                  )
                  : (
                    <Fragment key='total-1'>
                      {comparisonPeriods.map((period, index) => (
                        <Column key={'total-' + index + '-cell'} nonAria>
                          {period.label}
                        </Column>
                      ))}
                    </Fragment>
                  )}
              </Row>
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
          </ReportsTableBody>
        </ReportsTable>
      )}
    </ConditionalBlock>
  )
}
