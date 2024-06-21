import React from 'react'
import { BalanceSheet } from '../../types'
import { LineItem } from '../../types/line_item'
import { BalanceSheetRow } from '../BalanceSheetRow'

type BalanceSheetRowProps = {
  name: string
  display_name: string
  line_item: string
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
              lineItem={{
                display_name: row.display_name,
                line_items: data[
                  row.line_item as keyof BalanceSheet
                ] as LineItem[],
                value: undefined,
              }}
              summarize={false}
            />
          )
        })}
      </tbody>
    </table>
  )
}
