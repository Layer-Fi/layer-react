import { useMemo } from 'react'
import { getYear } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { useMileageSummary } from '@hooks/api/businesses/[business-id]/mileage/summary/useMileageSummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'

import './mileageTrackingStats.scss'

const EMPTY_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  miles: 0,
  estimatedDeduction: 0,
}))

interface StatBreakdown {
  business: number
  personal: number
  uncategorized: number
}

type MileageTrackingStatsCardProps = {
  title: string
  amount: number
  formatAsMoney?: boolean
  breakdown?: StatBreakdown
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

const MileageTrackingStatsCard = ({ title, amount, formatAsMoney, breakdown }: MileageTrackingStatsCardProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()

  return (
    <VStack className='Layer__MileageTrackingStats__Card' gap='3xs'>
      <Span size='md'>{title}</Span>
      {formatAsMoney
        ? <MoneySpan amount={amount} size='lg' weight='bold' />
        : <Span size='lg' weight='bold'>{formatNumber(amount)}</Span>}
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
  const { data: mileageData, isLoading, isError } = useMileageSummary()
  const { startDate } = useGlobalDateRange({ dateSelectionMode: 'year' })
  const selectedYear = getYear(startDate)

  const selectedYearData = useMemo(() => {
    return mileageData?.years.find(y => y.year === selectedYear)
  }, [mileageData, selectedYear])

  const chartData = useMemo(() => {
    if (!selectedYearData) return { years: [{ year: selectedYear, months: EMPTY_MONTHS }] }

    return {
      years: [{
        year: selectedYearData.year,
        months: selectedYearData.months.map(({ month, miles, estimatedDeduction }) => ({
          month,
          miles,
          estimatedDeduction,
        })),
      }],
    }
  }, [selectedYearData, selectedYear])

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
