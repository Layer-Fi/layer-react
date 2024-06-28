import React from 'react'
import { centsToDollars } from '../../models/Money'
import { StatementOfCashFlow } from '../../types'
import { LineItem } from '../../types/line_item'
import { StatementOfCashFlowRow } from '../StatementOfCashFlowRow'

type StatementOfCashFlowRowProps = {
  name: string
  displayName: string
  lineItem: string | undefined
  summarize: boolean
  type: string
}

export const StatementOfCashFlowTable = ({
  data,
  config,
}: {
  data: StatementOfCashFlow
  config: StatementOfCashFlowRowProps[]
}) => {
  return (
    <table className='Layer__table Layer__table--hover-effect Layer__statement-of-cash-flow__table'>
      <tbody>
        {config.map((row, idx) => {
          return row.type === 'line_item' ? (
            <StatementOfCashFlowRow
              key={'statement-of-cash-flow-row-' + idx + row.name}
              lineItem={
                data[row.lineItem as keyof StatementOfCashFlow] as LineItem
              }
              summarize={row.summarize}
              defaultExpanded={true}
            />
          ) : (
            <StatementOfCashFlowRow
              key={'statement-of-cash-flow-row-' + idx + row.name}
              lineItem={{
                name: row.name,
                display_name: row.displayName,
                value: data[
                  row.lineItem as keyof StatementOfCashFlow
                ] as number,
                line_items: null,
                is_contra: false,
              }}
              summarize={row.summarize}
              defaultExpanded={true}
            />
          )
        })}
      </tbody>
    </table>
  )
}
