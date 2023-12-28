import React, { useContext } from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'

export const ProfitAndLossSummaries = () => {
  const { data: storedData } = useContext(PNL.Context)
  const data = !!storedData
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
    <div className="Layer__profit-and-loss-summaries">
      <div className="Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--income">
        <span className="Layer__profit-and-loss-summaries__title">Revenue</span>
        <span
          className={`Layer__profit-and-loss-summaries__amount ${incomeDirectionClass}`}
        >
          {formatMoney(Math.abs(data.income.value))}
        </span>
      </div>
      <div className="Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--expenses">
        <span className="Layer__profit-and-loss-summaries__title">
          Expenses
        </span>
        <span
          className={`Layer__profit-and-loss-summaries__amount ${expensesDirectionClass}`}
        >
          {formatMoney(Math.abs((data.income.value ?? 0) - data.net_profit))}
        </span>
      </div>
      <div className="Layer__profit-and-loss-summaries__summary Layer__profit-and-loss-summaries__summary--net-profit">
        <span className="Layer__profit-and-loss-summaries__title">
          Net Profit
        </span>
        <span
          className={`Layer__profit-and-loss-summaries__amount ${netProfitDirectionClass}`}
        >
          {formatMoney(Math.abs(data.net_profit))}
        </span>
      </div>
    </div>
  )
}
