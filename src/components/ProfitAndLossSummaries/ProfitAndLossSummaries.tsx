import React, { useContext } from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { SkeletonLoader } from '../SkeletonLoader'

type Props = {
  revenueLabel?: string
  vertical?: boolean
}

export const ProfitAndLossSummaries = ({
  vertical,
  revenueLabel = 'Revenue',
}: Props) => {
  const { data: storedData, isLoading } = useContext(PNL.Context)
  const data = storedData
    ? storedData
    : { income: { value: NaN }, net_profit: NaN }

  const incomeDirectionClass =
    (data.income.value ?? NaN) < 0
      ? 'Layer__profit-and-loss-summaries__amount--negative'
      : 'Layer__profit-and-loss-summaries__amount--pasitive'

  const expensesDirectionClass =
    (data?.income?.value ?? NaN) - data.net_profit < 0
      ? 'Layer__profit-and-loss-summaries__amount--negative'
      : 'Layer__profit-and-loss-summaries__amount--pasitive'

  const netProfitDirectionClass =
    data.net_profit < 0
      ? 'Layer__profit-and-loss-summaries__amount--negative'
      : 'Layer__profit-and-loss-summaries__amount--pasitive'

  return (
    <div
      className={`Layer__profit-and-loss-summaries ${
        vertical ? 'flex-col' : ''
      }`}
    >
      <div className='Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--income'>
        <span className='Layer__profit-and-loss-summaries__title'>
          {revenueLabel}
        </span>
        {isLoading || storedData === undefined ? (
          <SkeletonLoader />
        ) : (
          <span
            className={`Layer__profit-and-loss-summaries__amount ${incomeDirectionClass}`}
          >
            {formatMoney(Math.abs(data?.income?.value ?? NaN))}
          </span>
        )}
      </div>
      <div className='Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--expenses'>
        <span className='Layer__profit-and-loss-summaries__title'>
          Expenses
        </span>
        {isLoading || storedData === undefined ? (
          <SkeletonLoader />
        ) : (
          <span
            className={`Layer__profit-and-loss-summaries__amount ${expensesDirectionClass}`}
          >
            {formatMoney(Math.abs((data.income.value ?? 0) - data.net_profit))}
          </span>
        )}
      </div>
      <div className='Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--net-profit'>
        <span className='Layer__profit-and-loss-summaries__title'>
          Net Profit
        </span>
        {isLoading || storedData === undefined ? (
          <SkeletonLoader />
        ) : (
          <span
            className={`Layer__profit-and-loss-summaries__amount ${netProfitDirectionClass}`}
          >
            {formatMoney(Math.abs(data.net_profit))}
          </span>
        )}
      </div>
    </div>
  )
}
