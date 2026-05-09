import { useTranslation } from 'react-i18next'

import { useMileageTrackingYearlySummary } from '@hooks/features/mileage/useMileageTrackingYearlySummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'

import './mileageTrackingStats.scss'

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
    <VStack className='Layer__MileageTrackingStats__Card' gap='3xs' pi='xs' pb='xs'>
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

export const MileageTrackingStats = () => {
  const { t } = useTranslation()
  const { data: mileageData, selectedYear, selectedYearData, chartData, isLoading, isError } = useMileageTrackingYearlySummary()

  if (isError) {
    return (
      <Container name='mileage-tracking-stats'>
        <DataState status={DataStateStatus.failed} title={t('mileageTracking:error.load_mileage_summary_data', 'Failed to load mileage summary data')} spacing />
      </Container>
    )
  }

  if (isLoading || !mileageData) {
    return (
      <Container name='mileage-tracking-stats'>
        <HStack className='Layer__MileageTrackingStats__Content' gap='lg' justify='center' align='center'>
          <Loader />
        </HStack>
      </Container>
    )
  }

  return (
    <Container name='mileage-tracking-stats'>
      <div className='Layer__MileageTrackingStats__Content'>
        <VStack className='Layer__MileageTrackingStats__Cards' gap='md' justify='center'>
          <MileageTrackingStatsCard
            title={t('mileageTracking:label.total_deduction', 'Total Deduction')}
            amount={selectedYearData?.estimatedDeduction ?? 0}
            formatAsMoney
          />
          <MileageTrackingStatsCard
            title={t('mileageTracking:label.total_miles', 'Total Miles')}
            amount={selectedYearData?.miles ?? 0}
            breakdown={{
              business: selectedYearData?.businessMiles ?? 0,
              personal: selectedYearData?.personalMiles ?? 0,
              uncategorized: selectedYearData?.uncategorizedMiles ?? 0,
            }}
          />
          <MileageTrackingStatsCard
            title={t('trips:label.trips', 'Trips')}
            amount={selectedYearData?.trips ?? 0}
            breakdown={{
              business: selectedYearData?.businessTrips ?? 0,
              personal: selectedYearData?.personalTrips ?? 0,
              uncategorized: selectedYearData?.uncategorizedTrips ?? 0,
            }}
          />
        </VStack>
        <VStack className='Layer__MileageTrackingStats__Chart' fluid justify='end'>
          <MileageDeductionChart data={chartData} selectedYear={selectedYear} />
        </VStack>
      </div>
    </Container>
  )
}
