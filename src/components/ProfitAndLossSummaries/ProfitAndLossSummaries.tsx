import React, { useContext } from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'

export const ProfitAndLossSummaries = () => {
  const { data: storedData } = useContext(PNL.Context)
  const data = !!storedData
    ? storedData
    : { income: { value: NaN }, net_profit: NaN }

  return (
    <div className="Layer__profit-and-loss-summaries">
      <div className="Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--income">
        <span className="Layer__profit-and-loss-summaries__title">Revenue</span>
        <span className="Layer__profit-and-loss-summaries__amount">
          {formatMoney(data.income.value)}
        </span>
      </div>
      <div className="Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--expenses">
        <span className="Layer__profit-and-loss-summaries__title">
          Expenses
        </span>
        <span className="Layer__profit-and-loss-summaries__amount">
          {formatMoney(Math.abs((data.income.value ?? 0) - data.net_profit))}
        </span>
      </div>
      <div className="Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--net-profit">
        <span className="Layer__profit-and-loss-summaries__title">
          Net Profit
        </span>
        <span className="Layer__profit-and-loss-summaries__amount">
          {formatMoney(data.net_profit)}
        </span>
      </div>
    </div>
  )
}
