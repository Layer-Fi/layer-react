import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'
import { HStack } from '@ui/Stack/Stack'
import { Swatch } from '@ui/Swatch/Swatch'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './profitAndLossSummaryTileFooterRow.scss'

export const legacyClassNames = createLegacyClassNames({
  Layer__ProfitAndLossSummaryTileFooter: 'Layer__BaseSummariesBreakdownFooter',
  Layer__ProfitAndLossSummaryTileFooter__Row: 'Layer__BaseSummariesBreakdownFooter__Row',
})

export type ProfitAndLossSummaryTileFooterRowConfig = {
  label: string
  amount: number
  swatchColor?: string
}

export function ProfitAndLossSummaryTileFooterRow({
  row,
  isLoading = false,
}: {
  row: ProfitAndLossSummaryTileFooterRowConfig
  isLoading?: boolean
}) {
  return (
    <div className={legacyClassNames('Layer__ProfitAndLossSummaryTileFooter__Row')}>
      <HStack gap='xs' align='center'>
        {row.swatchColor && <Swatch color={row.swatchColor} />}
        <Span size='sm'>{row.label}</Span>
      </HStack>
      {isLoading
        ? <SkeletonLoader width='4rem' height='18px' />
        : <MoneySpan amount={row.amount} weight='bold' numeric='tabular-nums' size='md' />}
    </div>
  )
}
