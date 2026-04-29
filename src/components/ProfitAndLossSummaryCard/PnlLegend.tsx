import { useTranslation } from 'react-i18next'

import { HStack, Stack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './pnlLegend.scss'

const Swatch = ({ className }: { className: string }) => (
  <span className={`Layer__PnlLegend__Swatch ${className}`} aria-hidden />
)

export type PnlLegendProps = {
  direction?: 'row' | 'column'
}

export const PnlLegend = ({ direction = 'row' }: PnlLegendProps) => {
  const { t } = useTranslation()
  return (
    <Stack className='Layer__PnlLegend' direction={direction} gap={direction === 'row' ? 'md' : '2xs'} pis={direction === 'column' ? 'md' : undefined} pbe={direction === 'column' ? 'md' : undefined}>
      <HStack gap='2xs' align='center'>
        <Swatch className='Layer__PnlLegend__Swatch--income' />
        <Span size='sm'>{t('common:label.revenue', 'Revenue')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch className='Layer__PnlLegend__Swatch--expenses' />
        <Span size='sm'>{t('common:label.expenses', 'Expenses')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch className='Layer__PnlLegend__Swatch--uncategorized' />
        <Span size='sm'>{t('common:label.uncategorized', 'Uncategorized')}</Span>
      </HStack>
    </Stack>
  )
}
