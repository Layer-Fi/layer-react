import { HStack } from '@ui/Stack/Stack'
import { Swatch } from '@ui/Swatch/Swatch'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './baseSummariesBreakdownFooterRow.scss'

export type BaseSummariesBreakdownRow = {
  label: string
  amount: number
  swatchColor?: string
}

export function BaseSummariesBreakdownFooterRow({
  row,
  isLoading = false,
}: {
  row: BaseSummariesBreakdownRow
  isLoading?: boolean
}) {
  return (
    <div className='Layer__BaseSummariesBreakdownFooter__Row'>
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
