import React, { useContext } from 'react'
import { Direction } from '../../types'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossRow } from '../ProfitAndLossRow'

export const ProfitAndLossTable = () => {
  const { data, isLoading } = useContext(ProfitAndLoss.Context)
  return (
    <div className="Layer__profit-and-loss-table">
      {!data || isLoading ? (
        <div>Loading</div>
      ) : (
        <>
          <ProfitAndLossRow
            lineItem={data.income}
            direction={Direction.CREDIT}
          />
          <ProfitAndLossRow
            lineItem={data.cost_of_goods_sold}
            direction={Direction.DEBIT}
          />
          <ProfitAndLossRow
            lineItem={{
              value: data.gross_profit,
              display_name: 'Gross Profit',
            }}
            variant="GROSS"
            direction={Direction.CREDIT}
          />
          <ProfitAndLossRow
            lineItem={data.expenses}
            direction={Direction.DEBIT}
          />
          <ProfitAndLossRow
            lineItem={{
              value: data.profit_before_taxes,
              display_name: 'Profit Before Taxes',
            }}
            variant="BEFORETAX"
            direction={Direction.CREDIT}
          />
          <ProfitAndLossRow lineItem={data.taxes} direction={Direction.DEBIT} />
          <ProfitAndLossRow
            lineItem={{
              value: data.net_profit,
              display_name: 'Net Profit',
            }}
            variant="NETPROFIT"
            direction={Direction.CREDIT}
          />
          <ProfitAndLossRow
            lineItem={data.other_outflows}
            direction={Direction.DEBIT}
          />
          <ProfitAndLossRow
            lineItem={data.personal_expenses}
            direction={Direction.DEBIT}
          />
        </>
      )}
    </div>
  )
}
