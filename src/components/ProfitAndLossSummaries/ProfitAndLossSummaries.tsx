import React, { useContext, useMemo } from 'react'
import { Scope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import Check from '../../icons/Check'
import { centsToDollars as formatMoney } from '../../models/Money'
import { ProfitAndLoss } from '../../types'
import { LineBaseItem } from '../../types/line_item'
import {
  collectExpensesItems,
  collectRevenueItems,
} from '../../utils/profitAndLossUtils'
import { Badge, BadgeVariant } from '../Badge'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { SkeletonLoader } from '../SkeletonLoader'
import { Text, TextSize } from '../Typography'
import { MiniChart } from './MiniChart'
import classNames from 'classnames'

export interface ProfitAndLossSummariesStringOverrides {
  revenueLabel?: string
  expensesLabel?: string
  netProfitLabel?: string
}

type Props = {
  vertical?: boolean
  actionable?: boolean
  revenueLabel?: string // deprecated
  stringOverrides?: ProfitAndLossSummariesStringOverrides
  showUncategorized?: boolean
}

const CHART_PLACEHOLDER = [
  {
    name: 'placeholder',
    display_name: 'placeholder',
    value: 1,
    type: 'placeholder',
    share: 1,
  },
]

const buildMiniChartData = (scope: Scope, data?: ProfitAndLoss) => {
  if (!data) {
    return CHART_PLACEHOLDER
  }

  let items: LineBaseItem[] = []

  switch (scope) {
    case 'revenue':
      items = collectRevenueItems(data)
      break
    default:
      items = collectExpensesItems(data)
  }

  if (
    !items ||
    items.length === 0 ||
    !items.find(x => Math.abs(x.value) !== 0)
  ) {
    return CHART_PLACEHOLDER
  }

  return items.slice()
}

export const ProfitAndLossSummaries = ({
  vertical,
  actionable = false,
  revenueLabel, // deprecated
  stringOverrides,
  showUncategorized = false,
}: Props) => {
  const {
    data: storedData,
    uncategorizedTotalExpenses,
    uncategorizedTotalRevenue,
    uncategorizedTransactions,
    categorizedTransactions,
    isLoading,
    setSidebarScope,
    sidebarScope,
  } = useContext(PNL.Context)

  const dataItem = Array.isArray(storedData)
    ? storedData[storedData.length - 1]
    : storedData

  const expensesChartData = useMemo(() => {
    return buildMiniChartData('expenses', dataItem)
  }, [storedData])

  const revenueChartData = useMemo(() => {
    return buildMiniChartData('revenue', dataItem)
  }, [storedData])

  const data = dataItem ? dataItem : { income: { value: NaN }, net_profit: NaN }

  const incomeDirectionClass =
    (data.income.value ?? NaN) < 0
      ? 'Layer__profit-and-loss-summaries__amount--negative'
      : 'Layer__profit-and-loss-summaries__amount--positive'

  const expensesDirectionClass =
    (data?.income?.value ?? NaN) - data.net_profit < 0
      ? 'Layer__profit-and-loss-summaries__amount--negative'
      : 'Layer__profit-and-loss-summaries__amount--positive'

  const netProfitDirectionClass =
    data.net_profit < 0
      ? 'Layer__profit-and-loss-summaries__amount--negative'
      : 'Layer__profit-and-loss-summaries__amount--positive'

  const expenses = Math.abs((data.income.value ?? 0) - data.net_profit)

  return (
    <div
      className={`Layer__profit-and-loss-summaries ${
        vertical ? 'flex-col' : ''
      }`}
    >
      <div
        className={classNames(
          'Layer__profit-and-loss-summaries__summary',
          actionable && 'Layer__actionable',
          'Layer__profit-and-loss-summaries__summary--income',
          sidebarScope === 'revenue' ? 'active' : '',
        )}
        onClick={() => {
          actionable && setSidebarScope('revenue')
        }}
      >
        <div className='Layer__profit-and-loss-summaries__summary__content'>
          <MiniChart data={revenueChartData} />
          <div className='Layer__profit-and-loss-summaries__text'>
            <span className='Layer__profit-and-loss-summaries__title'>
              {stringOverrides?.revenueLabel || revenueLabel || 'Revenue'}
            </span>
            {isLoading || storedData === undefined ? (
              <div className='Layer__profit-and-loss-summaries__loader'>
                <SkeletonLoader />
              </div>
            ) : (
              <div className='Layer__profit-and-loss-summaries__amount-wrapper'>
                <span
                  className={`Layer__profit-and-loss-summaries__amount ${incomeDirectionClass}`}
                >
                  {formatMoney(Math.abs(data?.income?.value ?? NaN))}
                </span>
              </div>
            )}
          </div>
        </div>
        {showUncategorized &&
        !dataItem?.fully_categorized &&
        uncategorizedTotalRevenue ? (
          <div className='Layer__profit-and-loss-summaries__info-banner'>
            <Text
              size={TextSize.sm}
              className='Layer__profit-and-loss-summaries-hide-xs'
            >
              Uncategorized
            </Text>
            <span className='Layer__profit-and-loss-summaries__info-banner__value'>
              <Text size={TextSize.sm}>{`$${formatMoney(
                uncategorizedTotalRevenue,
              )}`}</Text>
              <Text
                size={TextSize.sm}
                className='Layer__profit-and-loss-summaries__info-banner__subvalue'
              >
                /
                {`$${formatMoney(
                  uncategorizedTotalRevenue ??
                    0 + Math.abs(data?.income?.value ?? 0),
                )}`}
              </Text>
            </span>
          </div>
        ) : null}
        {showUncategorized &&
        !dataItem?.fully_categorized &&
        !uncategorizedTotalRevenue ? (
          <div className='Layer__profit-and-loss-summaries__info-banner Layer__profit-and-loss-summaries__info-banner--done'>
            <Check />
            <Text size={TextSize.sm}>All categorized</Text>
          </div>
        ) : null}
      </div>
      <div
        className={classNames(
          'Layer__profit-and-loss-summaries__summary',
          actionable && 'Layer__actionable',
          'Layer__profit-and-loss-summaries__summary--expenses',
          sidebarScope === 'expenses' ? 'active' : '',
        )}
        onClick={() => {
          actionable && setSidebarScope('expenses')
        }}
      >
        <div className='Layer__profit-and-loss-summaries__summary__content'>
          <MiniChart data={expensesChartData} />
          <div className='Layer__profit-and-loss-summaries__text'>
            <span className='Layer__profit-and-loss-summaries__title'>
              {stringOverrides?.expensesLabel || 'Expenses'}
            </span>
            {isLoading || storedData === undefined ? (
              <div className='Layer__profit-and-loss-summaries__loader'>
                <SkeletonLoader className='Layer__profit-and-loss-summaries__loader' />
              </div>
            ) : (
              <div className='Layer__profit-and-loss-summaries__amount-wrapper'>
                <span
                  className={`Layer__profit-and-loss-summaries__amount ${expensesDirectionClass}`}
                >
                  {formatMoney(
                    Math.abs((data.income.value ?? 0) - data.net_profit),
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
        {showUncategorized &&
        !dataItem?.fully_categorized &&
        uncategorizedTotalExpenses ? (
          <div className='Layer__profit-and-loss-summaries__info-banner'>
            <Text
              size={TextSize.sm}
              className='Layer__profit-and-loss-summaries-hide-xs'
            >
              Uncategorized
            </Text>
            <span className='Layer__profit-and-loss-summaries__info-banner__value'>
              <Text size={TextSize.sm}>{`$${formatMoney(
                uncategorizedTotalExpenses,
              )}`}</Text>
              <Text
                size={TextSize.sm}
                className='Layer__profit-and-loss-summaries__info-banner__subvalue'
              >
                /
                {`$${formatMoney(
                  Math.abs(uncategorizedTotalExpenses ?? 0) + expenses,
                )}`}
              </Text>
            </span>
          </div>
        ) : null}
        {showUncategorized &&
        !dataItem?.fully_categorized &&
        !uncategorizedTotalExpenses ? (
          <div className='Layer__profit-and-loss-summaries__info-banner Layer__profit-and-loss-summaries__info-banner--done'>
            <Check />
            <Text size={TextSize.sm}>All categorized</Text>
          </div>
        ) : null}
      </div>
      <div
        className={classNames(
          'Layer__profit-and-loss-summaries__summary net-profit Layer__profit-and-loss-summaries__summary--net-profit',
          actionable && 'Layer__actionable',
        )}
      >
        <div className='Layer__profit-and-loss-summaries__summary__content'>
          <div className='Layer__profit-and-loss-summaries__text'>
            <span className='Layer__profit-and-loss-summaries__title'>
              {stringOverrides?.netProfitLabel || 'Net Profit'}
            </span>
            {isLoading || storedData === undefined ? (
              <div className='Layer__profit-and-loss-summaries__loader'>
                <SkeletonLoader className='Layer__profit-and-loss-summaries__loader' />
              </div>
            ) : (
              <span
                className={`Layer__profit-and-loss-summaries__amount ${netProfitDirectionClass}`}
              >
                {formatMoney(Math.abs(data.net_profit))}
              </span>
            )}
          </div>
        </div>
        {showUncategorized && !dataItem?.fully_categorized && (
          <div className='Layer__profit-and-loss-summaries__info-banner'>
            <Text size={TextSize.sm}>Uncategorized</Text>
            <span className='Layer__profit-and-loss-summaries__info-banner__value'>
              <Text size={TextSize.sm}>
                {uncategorizedTransactions ?? 0}/
                {(uncategorizedTransactions ?? 0) +
                  (categorizedTransactions ?? 0)}{' '}
                <span className='Layer__profit-and-loss-summaries-hide-xs'>
                  transactions
                </span>
              </Text>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
