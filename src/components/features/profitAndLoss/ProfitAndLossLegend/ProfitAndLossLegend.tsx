import { useTranslation } from 'react-i18next'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { HStack, Stack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './profitAndLossLegend.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__ProfitAndLossLegend__Swatch': 'Layer__PnlLegend__Swatch',
  'Layer__ProfitAndLossLegend': 'Layer__PnlLegend',
  'Layer__ProfitAndLossLegend__Swatch--income': 'Layer__PnlLegend__Swatch--income',
  'Layer__ProfitAndLossLegend__Swatch--expenses': 'Layer__PnlLegend__Swatch--expenses',
  'Layer__ProfitAndLossLegend__Swatch--uncategorized': 'Layer__PnlLegend__Swatch--uncategorized',
})

const Swatch = ({ className }: { className: string }) => (
  <span className={`${legacyClassNames('Layer__ProfitAndLossLegend__Swatch')} ${className}`} aria-hidden />
)

export type ProfitAndLossLegendProps = {
  direction?: 'row' | 'column'
}

export const ProfitAndLossLegend = ({ direction = 'row' }: ProfitAndLossLegendProps) => {
  const { t } = useTranslation()
  return (
    <Stack
      className={legacyClassNames('Layer__ProfitAndLossLegend')}
      direction={direction}
      align='start'
      gap={direction === 'row' ? 'md' : '2xs'}
      pis={direction === 'column' ? 'md' : undefined}
      pbe={direction === 'column' ? 'md' : undefined}
    >
      <HStack gap='2xs' align='center'>
        <Swatch className={legacyClassNames('Layer__ProfitAndLossLegend__Swatch--income')} />
        <Span size='sm'>{t('common:label.revenue', 'Revenue')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch className={legacyClassNames('Layer__ProfitAndLossLegend__Swatch--expenses')} />
        <Span size='sm'>{t('common:label.expenses', 'Expenses')}</Span>
      </HStack>
      <HStack gap='2xs' align='center'>
        <Swatch className={legacyClassNames('Layer__ProfitAndLossLegend__Swatch--uncategorized')} />
        <Span size='sm'>{t('common:label.uncategorized', 'Uncategorized')}</Span>
      </HStack>
    </Stack>
  )
}
