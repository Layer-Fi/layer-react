import React from 'react'
import { BalanceSheet } from '../../types'
import { LineItem } from '../../types/line_item'
import { BalanceSheetRow } from '../BalanceSheetRow'

type BalanceSheetRowProps = {
  name: string
  displayName: string
  lineItem: string
}

export const BalanceSheetTable = ({
  data,
  config,
}: {
  data: BalanceSheet
  config: BalanceSheetRowProps[]
}) => {
  return (
    <table className='Layer__table Layer__table--hover-effect Layer__balance-sheet__table'>
      <thead>
        <tr>
          <th className='Layer__table-header'>Type</th>
          <th className='Layer__table-header Layer__table-cell--last'>Total</th>
        </tr>
      </thead>

      <tbody>
        {config.map((row, idx) => {
          return (
            <BalanceSheetRow
              key={'balance-sheet-row-' + idx + row.name}
              lineItem={data[row.lineItem as keyof BalanceSheet] as LineItem}
              summarize={true}
              defaultExpanded={idx === 0 ? true : false}
            />
          )
        })}
      </tbody>
    </table>
  )
}
