import React from 'react'
import { StatementOfCashFlow } from '../../types'
import { LineItem } from '../../types/line_item'
import { StatementOfCashFlowRow } from '../StatementOfCashFlowRow'

type StatementOfCashFlowRowProps = {
  name: string
  displayName: string
  lineItem: string
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
          return (
            <StatementOfCashFlowRow
              key={'statement-of-cash-flow-row-' + idx + row.name}
              lineItem={
                data[row.lineItem as keyof StatementOfCashFlow] as LineItem
              }
              summarize={true}
              defaultExpanded={true}
            />
          )
        })}
      </tbody>
    </table>
  )
}
