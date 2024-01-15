import React, { useContext } from 'react'
import { Direction } from '../../types'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossRow } from '../ProfitAndLossRow'
import emptyPNL from './empty_profit_and_loss_report'

export const ProfitAndLossTable = () => {
  const { data: actualData, isLoading } = useContext(ProfitAndLoss.Context)
  const data = !actualData || isLoading ? emptyPNL : actualData
  return (
    <>
      <div className='Layer__profit-and-loss-table'>
        <ProfitAndLossRow lineItem={data.income} direction={Direction.CREDIT} />
        <ProfitAndLossRow
          lineItem={data.cost_of_goods_sold}
          direction={Direction.DEBIT}
        />
        <ProfitAndLossRow
          lineItem={{
            value: data.gross_profit,
            display_name: 'Gross Profit',
          }}
          variant='summation'
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
          variant='summation'
          direction={Direction.CREDIT}
        />
        <ProfitAndLossRow lineItem={data.taxes} direction={Direction.DEBIT} />
        <ProfitAndLossRow
          lineItem={{
            value: data.net_profit,
            display_name: 'Net Profit',
          }}
          variant='summation'
          direction={Direction.CREDIT}
        />
      </div>
      <div className='Layer__profit-and-loss-table Layer__profit-and-loss-table__outflows'>
        <ProfitAndLossRow
          lineItem={data.other_outflows}
          direction={Direction.DEBIT}
        />
        <ProfitAndLossRow
          lineItem={data.personal_expenses}
          direction={Direction.DEBIT}
        />
      </div>
    </>
  )
}
