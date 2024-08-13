import React, { useContext, useMemo } from 'react'
import { Scope } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { centsToDollars as formatMoney } from '../../models/Money'
import { ProfitAndLoss } from '../../types'
import { LineBaseItem } from '../../types/line_item'
import {
  collectExpensesItems,
  collectRevenueItems,
} from '../../utils/profitAndLossUtils'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { SkeletonLoader } from '../SkeletonLoader'
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
}: Props) => {
  const {
    data: storedData,
    uncategorizedTotalExpenses,
    uncategorizedTotalRevenue,
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

  console.log('data', data)

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
              {uncategorizedTotalRevenue && (
                <span
                  className={`Layer__profit-and-loss-summaries__amount-uncategorized ${expensesDirectionClass}`}
                >
                  {formatMoney(uncategorizedTotalRevenue)}
                </span>
              )}
            </div>
          )}
        </div>
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
              {uncategorizedTotalExpenses && (
                <span
                  className={`Layer__profit-and-loss-summaries__amount-uncategorized ${expensesDirectionClass}`}
                >
                  {formatMoney(uncategorizedTotalExpenses)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className={classNames(
          'Layer__profit-and-loss-summaries__summary net-profit Layer__profit-and-loss-summaries__summary--net-profit',
          actionable && 'Layer__actionable',
        )}
      >
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
    </div>
  )
}
