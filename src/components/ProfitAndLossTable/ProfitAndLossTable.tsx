import React, { useContext } from 'react'
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
          <ProfitAndLossRow lineItem={data.income} />
          <ProfitAndLossRow lineItem={data.cost_of_goods_sold} />
          <ProfitAndLossRow
            lineItem={{
              value: data.gross_profit,
              display_name: 'Gross Profit',
            }}
            variant="GROSS"
          />
          <ProfitAndLossRow lineItem={data.expenses} />
          <ProfitAndLossRow
            lineItem={{
              value: data.profit_before_taxes,
              display_name: 'Profit Before Taxes',
            }}
            variant="BEFORETAX"
          />
          <ProfitAndLossRow lineItem={data.taxes} />
          <ProfitAndLossRow
            lineItem={{
              value: data.net_profit,
              display_name: 'Net Profit',
            }}
            variant="NETPROFIT"
          />
          <ProfitAndLossRow lineItem={data.other_outflows} />
          <ProfitAndLossRow lineItem={data.personal_expenses} />
        </>
      )}
    </div>
  )
}
