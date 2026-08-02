import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './mileageTrackingStatsCard.scss'

interface StatBreakdown {
  business: number
  personal: number
  uncategorized: number
}

export type MileageTrackingStatsCardProps = {
  title: string
  amount: number
  formatAsMoney?: boolean
  breakdown?: StatBreakdown
  description?: string
}

const MileageTrackingStatsRow = ({ label, value }: { label: string, value: number }) => {
  const { formatNumber } = useIntlFormatter()

  return (
    <VStack gap='3xs'>
      <Span size='xs' variant='subtle'>{label}</Span>
      <Span size='sm'>{formatNumber(value)}</Span>
    </VStack>
  )
}

export const MileageTrackingStatsCard = ({ title, amount, formatAsMoney, breakdown, description }: MileageTrackingStatsCardProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  return (
    <VStack className='Layer__MileageTrackingStatsCard' gap='3xs' pi='xs' pb='xs'>
      <Span size='md'>{title}</Span>
      {formatAsMoney
        ? <MoneySpan amount={amount} size='lg' weight='bold' />
        : <Span size='lg' weight='bold'>{formatNumber(amount)}</Span>}
      {description && <Span size='xs' variant='subtle'>{description}</Span>}
      {breakdown && (
        <HStack gap='md'>
          <MileageTrackingStatsRow label={t('common:label.business', 'Business')} value={breakdown.business} />
          <MileageTrackingStatsRow label={t('common:label.personal', 'Personal')} value={breakdown.personal} />
          <MileageTrackingStatsRow label={t('common:label.uncategorized', 'Uncategorized')} value={breakdown.uncategorized} />
        </HStack>
      )}
    </VStack>
  )
}
