import React from 'react'
import { StatementOfCash } from '../../types'
import { LineItem } from '../../types/line_item'
import { StatementOfCashRow } from '../StatementOfCashRow'

type StatementOfCashRowProps = {
  name: string
  displayName: string
  lineItem: string
}

export const StatementOfCashTable = ({
  data,
  config,
}: {
  data: StatementOfCash
  config: StatementOfCashRowProps[]
}) => {
  return (
    <table className='Layer__table Layer__table--hover-effect Layer__statement-of-cash__table'>
      <tbody>
        {config.map((row, idx) => {
          return (
            <StatementOfCashRow
              key={'statement-of-cash-row-' + idx + row.name}
              lineItem={data[row.lineItem as keyof StatementOfCash] as LineItem}
              summarize={true}
            />
          )
        })}
      </tbody>
    </table>
  )
}
