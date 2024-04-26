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

type Props = {
  revenueLabel?: string
  vertical?: boolean
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
  revenueLabel = 'Revenue',
}: Props) => {
  const {
    data: storedData,
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

  return (
    <div
      className={`Layer__profit-and-loss-summaries ${
        vertical ? 'flex-col' : ''
      }`}
    >
      <div
        className={classNames(
          'Layer__profit-and-loss-summaries__summary Layer__actionable',
          'Layer__profit-and-loss-summaries__summary--income',
          sidebarScope === 'revenue' ? 'active' : '',
        )}
        onClick={() => setSidebarScope('revenue')}
      >
        <MiniChart data={revenueChartData} />
        <div className='Layer__profit-and-loss-summaries__text'>
          <span className='Layer__profit-and-loss-summaries__title'>
            {revenueLabel}
          </span>
          {isLoading || storedData === undefined ? (
            <div className='Layer__profit-and-loss-summaries__loader'>
              <SkeletonLoader />
            </div>
          ) : (
            <span
              className={`Layer__profit-and-loss-summaries__amount ${incomeDirectionClass}`}
            >
              {formatMoney(Math.abs(data?.income?.value ?? NaN))}
            </span>
          )}
        </div>
      </div>
      <div
        className={classNames(
          'Layer__profit-and-loss-summaries__summary Layer__actionable',
          'Layer__profit-and-loss-summaries__summary--expenses',
          sidebarScope === 'expenses' ? 'active' : '',
        )}
        onClick={() => setSidebarScope('expenses')}
      >
        <MiniChart data={expensesChartData} />
        <div className='Layer__profit-and-loss-summaries__text'>
          <span className='Layer__profit-and-loss-summaries__title'>
            Expenses
          </span>
          {isLoading || storedData === undefined ? (
            <div className='Layer__profit-and-loss-summaries__loader'>
              <SkeletonLoader className='Layer__profit-and-loss-summaries__loader' />
            </div>
          ) : (
            <span
              className={`Layer__profit-and-loss-summaries__amount ${expensesDirectionClass}`}
            >
              {formatMoney(
                Math.abs((data.income.value ?? 0) - data.net_profit),
              )}
            </span>
          )}
        </div>
      </div>
      <div className='Layer__profit-and-loss-summaries__summary net-profit Layer__profit-and-loss-summaries__summary--net-profit'>
        <div className='Layer__profit-and-loss-summaries__text'>
          <span className='Layer__profit-and-loss-summaries__title'>
            Net Profit
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
