import React from 'react'
import PNLRow from './PNLRow'
import { DisplayType, ProfitAndLoss } from '../../../types'
import { Direction } from '../util'
import classNames from 'classnames'

type Props = {
  pnlData: ProfitAndLoss;
  priorPnlData?: ProfitAndLoss;
  displayType: DisplayType;
  lastCol?: boolean;
  spaceForHeader?: boolean;
  showOutflows?: boolean;
  showPersonalExpenses?: boolean;
}

const PNLColumn = ({
  pnlData,
  displayType = 'values',
  priorPnlData,
  lastCol = false,
  spaceForHeader = false,
  showOutflows = false,
  showPersonalExpenses = false,
}: Props) => {
  let columnTitle
  if (displayType === 'month-over-month') {
    columnTitle = 'MoM'
  } else if (displayType === 'values' && pnlData.start_date) {
    columnTitle = new Date(pnlData.start_date).toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      year: 'numeric',
    })
  } else {
    columnTitle = ''
  }

  return (
    <div className='Layer__pdf-table-column'>
      <div
        className={
          classNames(
            'Layer__pdf-table-column-inner',
            lastCol ? 'Layer__pdf-table-column-inner--last' : ''
          )
        }
      >
        <div
          className={
            classNames(
              'Layer__pdf-column-title',
              (spaceForHeader && displayType === 'labels') ? 'Layer__pdf-column-title--with-space' : ''
            )
          }
        >
          {columnTitle}
        </div>
        <PNLRow
          lineItem={pnlData.income}
          priorLineItem={priorPnlData?.income}
          direction={Direction.CREDIT}
          displayType={displayType}
        />
        <PNLRow
          lineItem={pnlData.cost_of_goods_sold}
          priorLineItem={priorPnlData?.cost_of_goods_sold}
          direction={Direction.DEBIT}
          displayType={displayType}
          lowerIsBetter
        />
        <PNLRow
          lineItem={{
            value: pnlData.gross_profit,
            display_name: 'Gross Profit',
            is_contra: false,
          }}
          priorLineItem={
            priorPnlData
              ? {
                value: priorPnlData.gross_profit,
                display_name: 'Gross Profit',
                is_contra: false,
              }
              : null
          }
          direction={Direction.CREDIT}
          displayType={displayType}
        />
        <PNLRow
          lineItem={pnlData.expenses}
          priorLineItem={priorPnlData?.expenses}
          direction={Direction.DEBIT}
          displayType={displayType}
          lowerIsBetter
        />
        <PNLRow
          lineItem={{
            value: pnlData.profit_before_taxes,
            display_name: 'Profit Before Taxes',
            is_contra: false,
          }}
          priorLineItem={
            priorPnlData?.profit_before_taxes
              ? {
                value: priorPnlData.profit_before_taxes,
                display_name: 'Profit Before Taxes',
                is_contra: false,
              }
              : null
          }
          direction={Direction.CREDIT}
          displayType={displayType}
        />
        <PNLRow
          lineItem={pnlData.taxes}
          priorLineItem={priorPnlData?.taxes}
          direction={Direction.DEBIT}
          displayType={displayType}
          lowerIsBetter
        />
        <PNLRow
          lineItem={{
            value: pnlData.net_profit,
            display_name: 'Net Profit',
            is_contra: false,
          }}
          priorLineItem={
            priorPnlData
              ? {
                value: priorPnlData.net_profit,
                display_name: 'Net Profit',
                is_contra: false,
              }
              : null
          }
          direction={Direction.CREDIT}
          displayType={displayType}
        />
        {showOutflows && (
          <PNLRow
            lineItem={pnlData.other_outflows}
            priorLineItem={priorPnlData?.other_outflows}
            direction={Direction.DEBIT}
            displayType={displayType}
            lowerIsBetter
          />
        )}
        {showPersonalExpenses && (
          <PNLRow
            lineItem={pnlData.personal_expenses}
            priorLineItem={priorPnlData?.personal_expenses}
            direction={Direction.DEBIT}
            displayType={displayType}
            lowerIsBetter
          />
        )}
      </div>
    </div>
  )
}

export default PNLColumn
