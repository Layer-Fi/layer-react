import { useTranslation } from 'react-i18next'

import { HStack, Stack } from '@ui/Stack/Stack'
import { Swatch } from '@ui/Swatch/Swatch'
import { Span } from '@ui/Typography/Text'

export type PnlLegendProps = {
  direction?: 'row' | 'column'
}

export const PnlLegend = ({ direction = 'row' }: PnlLegendProps) => {
  const { t } = useTranslation()
  return (
    <Stack
      className='Layer__PnlLegend'
      direction={direction}
      align='start'
      gap={direction === 'row' ? 'md' : '2xs'}
      pis={direction === 'column' ? 'md' : undefined}
      pbe={direction === 'column' ? 'md' : undefined}
    >
      <HStack gap='2xs' align='center'>
        <Swatch color='var(--bar-color-income)' />
        <Span size='sm'>{t('common:label.revenue', 'Revenue')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch color='var(--bar-color-expenses)' />
        <Span size='sm'>{t('common:label.expenses', 'Expenses')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch color='var(--color-base-500)' pattern='stripes' />
        <Span size='sm'>{t('common:label.uncategorized', 'Uncategorized')}</Span>
      </HStack>
    </Stack>
  )
}
