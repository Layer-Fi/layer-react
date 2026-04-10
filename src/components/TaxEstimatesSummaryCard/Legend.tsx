import { ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import { getCategoryClassName } from './constants'
import type { SummaryCardProps } from './types'

type LegendProps = Pick<SummaryCardProps, 'categories' | 'total'> & {
  isMobile: boolean
}

export const Legend = ({
  categories,
  isMobile,
  total,
}: LegendProps) => {
  const { t } = useTranslation()
  const { formatPercent } = useIntlFormatter()
  const className = isMobile
    ? 'Layer__TaxEstimatesSummaryCard__LegendCard'
    : 'Layer__TaxEstimatesSummaryCard__Legend'

  return (
    <VStack className={className} gap='sm' fluid>
      <HStack justify='space-between' className='Layer__TaxEstimatesSummaryCard__LegendHeader'>
        <Span size='sm' variant='subtle'>{t('common:label.category', 'Category')}</Span>
        <HStack className='Layer__TaxEstimatesSummaryCard__LegendHeaderValue' align='center' gap='2xs'>
          <Span size='sm' variant='subtle'>{t('common:label.value', 'Value')}</Span>
          <ArrowUpDown size={12} />
        </HStack>
      </HStack>
      {categories.map(category => (
        <HStack key={category.key} className='Layer__TaxEstimatesSummaryCard__LegendRow' justify='space-between' align='center' gap='md'>
          <Span size='sm' className='Layer__TaxEstimatesSummaryCard__LegendLabel'>{category.label}</Span>
          <HStack className='Layer__TaxEstimatesSummaryCard__LegendValueGroup' align='center' gap='sm'>
            <MoneySpan size='sm' weight='bold' amount={category.amount} />
            <Span size='sm' variant='subtle'>
              {formatPercent(total === 0 ? 0 : category.amount / total)}
            </Span>
            <Span nonAria className={`Layer__TaxEstimatesSummaryCard__LegendSwatch ${getCategoryClassName(category.key)}`} />
          </HStack>
        </HStack>
      ))}
    </VStack>
  )
}
