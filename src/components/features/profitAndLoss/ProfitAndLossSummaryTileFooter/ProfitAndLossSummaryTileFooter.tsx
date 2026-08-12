import { type ReactNode } from 'react'

import { legacyClassNames } from '@features/profitAndLoss/ProfitAndLossSummaryTileFooter/ProfitAndLossSummaryTileFooterRow'
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
    <div className={legacyClassNames('Layer__ProfitAndLossSummaryTileFooter')}>
      {rows.map(row => (
        <ProfitAndLossSummaryTileFooterRow key={row.label} row={row} isLoading={isLoading} />
      ))}
      {slots?.Trailing}
    </div>
  )
}
