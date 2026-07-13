import { Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import type { LineItem } from '@schemas/common/lineItem'
import { useEffectOnMount } from '@hooks/utils/react/useEffectOnMount'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { type BreadcrumbItem } from '@components/DetailReportBreadcrumb/DetailReportBreadcrumb'
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
  stringOverrides,
  onLineItemClick,
}: ProfitAndLossTableProps) => {
  const { t } = useTranslation()
  const {
    data,
    isLoading,
    isError,
    isValidating,
  } = useContext(ProfitAndLossContext)

  const { isOpen, setIsOpen } = useTableExpandRow()

  useEffectOnMount(() => {
    setIsOpen(['income', 'cost_of_goods_sold', 'expenses', 'other_activity'])
  })

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

    const amount = Number.isNaN(lineItem.value) ? 0 : lineItem.value ?? 0

    return (
      <Fragment key={rowKey + '-' + rowIndex}>
        <ReportsTableRow
          depth={depth}
          expandable={!variant && expandable}
          summation={variant === 'summation'}
          onExpand={expandable ? () => setIsOpen(rowKey) : undefined}
        >
          <ReportsTableNameCell expandable={expandable} expanded={expanded} bold>
            {lineItem.displayName}
          </ReportsTableNameCell>
          {showValue && (
            <ReportsTableAmountCell
              amount={amount}
              bold
              onPress={variant !== 'summation' && onLineItemClick
                ? () => onLineItemClick(lineItem.name, currentBreadcrumbs)
                : undefined}
            />
          )}
        </ReportsTableRow>
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
    <ConditionalBlock
      data={data}
      isLoading={isLoading}
      isError={isError}
      Loading={<ReportsTableLoader showHeader={false} />}
      Inactive={null}
      Error={(
        <ReportsTableErrorState
          isLoading={isValidating}
        />
      )}
    >
      {({ data }) => (
        <ReportsTable bottomSpacing={false}>
          <ReportsTableBody>
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
                name: 'gross_profit',
                value: data.grossProfit,
                displayName: stringOverrides?.grossProfitLabel || t('common:label.gross_profit', 'Gross Profit'),
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
                  stringOverrides?.profitBeforeTaxesLabel || t('reports:label.profit_before_taxes', 'Profit Before Taxes'),
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
                displayName: stringOverrides?.netProfitLabel || t('common:label.net_profit', 'Net Profit'),
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
          </ReportsTableBody>
        </ReportsTable>
      )}
    </ConditionalBlock>
  )
}
