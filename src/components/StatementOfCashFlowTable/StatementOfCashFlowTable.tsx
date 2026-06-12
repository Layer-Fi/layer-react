import { Fragment } from 'react'

import { type LineItem } from '@internal-types/lineItem'
import { type StatementOfCashFlow } from '@internal-types/statementOfCashFlow'
import {
  ReportsTable,
  ReportsTableAmountCell,
  ReportsTableBody,
  ReportsTableHeader,
  ReportsTableLineItems,
  ReportsTableNameCell,
  ReportsTableRow,
} from '@components/ReportsTable/ReportsTable'

type StatementOfCashFlowRowProps = {
  name: string
  displayName: string
  lineItem: string | undefined
  summarize: boolean
  type: string
}

export interface StatementOfCashFlowTableStringOverrides {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

export const StatementOfCashFlowTable = ({
  data,
  config,
  stringOverrides,
}: {
  data: StatementOfCashFlow
  config: StatementOfCashFlowRowProps[]
  stringOverrides?: StatementOfCashFlowTableStringOverrides
}) => {
  return (
    <ReportsTable>
      <ReportsTableHeader
        typeColumnHeader={stringOverrides?.typeColumnHeader}
        totalColumnHeader={stringOverrides?.totalColumnHeader}
      />
      <ReportsTableBody>
        {config.map((row, idx) => {
          if (row.type === 'line_item') {
            return (
              <Fragment key={row.lineItem}>
                {data[row.lineItem as keyof StatementOfCashFlow] && (
                  <ReportsTableLineItems
                    lineItem={data[row.lineItem as keyof StatementOfCashFlow] as LineItem}
                    rowKey={row.lineItem ? row.lineItem : ''}
                    rowIndex={idx}
                  />
                )}
              </Fragment>
            )
          }
          else {
            return (
              <ReportsTableRow key={row.name + '-' + idx}>
                <ReportsTableNameCell bold>{row.displayName}</ReportsTableNameCell>
                <ReportsTableAmountCell
                  amount={(data[row.lineItem as keyof StatementOfCashFlow] as number) ?? 0}
                  bold
                />
              </ReportsTableRow>
            )
          }
        })}
      </ReportsTableBody>
    </ReportsTable>
  )
}
