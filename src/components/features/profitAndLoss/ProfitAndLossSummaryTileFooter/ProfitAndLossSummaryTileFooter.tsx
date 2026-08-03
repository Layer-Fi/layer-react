import { type ReactNode } from 'react'

import {
  ProfitAndLossSummaryTileFooterRow,
  type ProfitAndLossSummaryTileFooterRowConfig,
} from '@features/profitAndLoss/ProfitAndLossSummaryTileFooter/ProfitAndLossSummaryTileFooterRow'

import './profitAndLossSummaryTileFooter.scss'

type ProfitAndLossSummaryTileFooterProps = {
  rows: ProfitAndLossSummaryTileFooterRowConfig[]
  isLoading?: boolean
  slots?: {
    Trailing?: ReactNode
  }
}

export function ProfitAndLossSummaryTileFooter({
  rows,
  isLoading = false,
  slots,
}: ProfitAndLossSummaryTileFooterProps) {
  return (
    <div className='Layer__ProfitAndLossSummaryTileFooter'>
      {rows.map(row => (
        <ProfitAndLossSummaryTileFooterRow key={row.label} row={row} isLoading={isLoading} />
      ))}
      {slots?.Trailing}
    </div>
  )
}
