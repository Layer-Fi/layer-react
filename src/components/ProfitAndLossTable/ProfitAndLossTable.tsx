import React, { useContext } from 'react'
import { Direction } from '../../types'
import { Loader } from '../Loader'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossRow } from '../ProfitAndLossRow'
import emptyPNL from './empty_profit_and_loss_report'
import classNames from 'classnames'

type Props = {
  lockExpanded?: boolean
  asContainer?: boolean
}

export const ProfitAndLossTable = ({ lockExpanded, asContainer }: Props) => {
  const {
    data: actualData,
    isLoading,
    setSidebarScope,
  } = useContext(ProfitAndLoss.Context)
  const data = !actualData || isLoading ? emptyPNL : actualData

  if (isLoading || actualData === undefined) {
    return (
      <div
        className={classNames(
          'Layer__profit-and-loss-table__loader-container',
          asContainer && 'Layer__component-container',
        )}
      >
        <Loader />
      </div>
    )
  }

  return (
    <>
      <div
        className={classNames(
          'Layer__profit-and-loss-table Layer__profit-and-loss-table--main',
          asContainer && 'Layer__component-container',
        )}
      >
        <ProfitAndLossRow
          lineItem={data.income}
          direction={Direction.CREDIT}
          lockExpanded={lockExpanded}
          scope='revenue'
          setSidebarScope={setSidebarScope}
        />
        <ProfitAndLossRow
          lineItem={data.cost_of_goods_sold}
          direction={Direction.DEBIT}
          lockExpanded={lockExpanded}
          scope='expenses'
          setSidebarScope={setSidebarScope}
        />
        <ProfitAndLossRow
          lineItem={{
            value: data.gross_profit,
            display_name: 'Gross Profit',
          }}
          variant='summation'
          direction={Direction.CREDIT}
          lockExpanded={lockExpanded}
          scope='revenue'
          setSidebarScope={setSidebarScope}
        />
        <ProfitAndLossRow
          lineItem={data.expenses}
          direction={Direction.DEBIT}
          lockExpanded={lockExpanded}
          scope='expenses'
          setSidebarScope={setSidebarScope}
        />
        <ProfitAndLossRow
          lineItem={{
            value: data.profit_before_taxes,
            display_name: 'Profit Before Taxes',
          }}
          variant='summation'
          direction={Direction.CREDIT}
          lockExpanded={lockExpanded}
          scope='revenue'
          setSidebarScope={setSidebarScope}
        />
        <ProfitAndLossRow
          lineItem={data.taxes}
          direction={Direction.DEBIT}
          lockExpanded={lockExpanded}
          scope='expenses'
          setSidebarScope={setSidebarScope}
        />
        <ProfitAndLossRow
          lineItem={{
            value: data.net_profit,
            display_name: 'Net Profit',
          }}
          variant='summation'
          direction={Direction.CREDIT}
          lockExpanded={lockExpanded}
        />
      </div>
      {data.other_outflows || data.personal_expenses ? (
        <div className='Layer__profit-and-loss-table Layer__profit-and-loss-table__outflows'>
          <ProfitAndLossRow
            lineItem={data.other_outflows}
            direction={Direction.DEBIT}
            lockExpanded={lockExpanded}
          />
          <ProfitAndLossRow
            lineItem={data.personal_expenses}
            direction={Direction.DEBIT}
            lockExpanded={lockExpanded}
          />
        </div>
      ) : null}
    </>
  )
}
