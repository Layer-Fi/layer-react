import { Fragment } from 'react'

import type { BalanceSheet } from '@internal-types/balanceSheet'
import type { LineItem } from '@internal-types/lineItem'
import { useEffectOnMount } from '@hooks/utils/react/useEffectOnMount'
import { useTableExpandRow } from '@hooks/utils/tables/useTableExpandRow'
import {
  ReportsTable,
  ReportsTableBody,
  ReportsTableHeader,
  ReportsTableLineItems,
} from '@components/ReportsTable/ReportsTable'

export interface BalanceSheetTableStringOverrides {
  typeColumnHeader?: string
  totalColumnHeader?: string
}

type BalanceSheetRowProps = {
  name: string
  displayName: string
  lineItem: string
}

export const BalanceSheetTable = ({
  data,
  config,
  stringOverrides,
}: {
  data: BalanceSheet
  config: BalanceSheetRowProps[]
  stringOverrides?: BalanceSheetTableStringOverrides
}) => {
  const { setIsOpen } = useTableExpandRow()

  useEffectOnMount(() => {
    setIsOpen(['assets'])
  })

  return (
    <ReportsTable>
      <ReportsTableHeader
        typeColumnHeader={stringOverrides?.typeColumnHeader}
        totalColumnHeader={stringOverrides?.totalColumnHeader}
      />
      <ReportsTableBody>
        {config.map((row, idx) => (
          <Fragment key={row.lineItem}>
            {data[row.lineItem as keyof BalanceSheet] && (
              <ReportsTableLineItems
                lineItem={data[row.lineItem as keyof BalanceSheet] as LineItem}
                rowKey={row.lineItem}
                rowIndex={idx}
                withDividers
              />
            )}
          </Fragment>
        ))}
      </ReportsTableBody>
    </ReportsTable>
  )
}
