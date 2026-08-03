import { useTranslation } from 'react-i18next'

import { HStack, Stack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './profitAndLossLegend.scss'

const Swatch = ({ className }: { className: string }) => (
  <span className={`Layer__ProfitAndLossLegend__Swatch ${className}`} aria-hidden />
)

export type ProfitAndLossLegendProps = {
  direction?: 'row' | 'column'
}

export const ProfitAndLossLegend = ({ direction = 'row' }: ProfitAndLossLegendProps) => {
  const { t } = useTranslation()
  return (
    <Stack
      className='Layer__ProfitAndLossLegend'
      direction={direction}
      align='start'
      gap={direction === 'row' ? 'md' : '2xs'}
      pis={direction === 'column' ? 'md' : undefined}
      pbe={direction === 'column' ? 'md' : undefined}
    >
      <HStack gap='2xs' align='center'>
        <Swatch className='Layer__ProfitAndLossLegend__Swatch--income' />
        <Span size='sm'>{t('common:label.revenue', 'Revenue')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch className='Layer__ProfitAndLossLegend__Swatch--expenses' />
        <Span size='sm'>{t('common:label.expenses', 'Expenses')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch className='Layer__ProfitAndLossLegend__Swatch--uncategorized' />
        <Span size='sm'>{t('common:label.uncategorized', 'Uncategorized')}</Span>
      </HStack>
    </Stack>
  )
}
