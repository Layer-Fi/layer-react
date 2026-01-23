import { useMemo } from 'react'
import { getYear } from 'date-fns'

import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'
import { useMileageSummary } from '@features/mileage/api/useMileageSummary'

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

const MileageTrackingStatsRow = ({ label, value }: { label: string, value: number }) => (
  <VStack gap='3xs'>
    <Span size='xs' variant='subtle'>{label}</Span>
    <Span size='sm'>{value.toLocaleString()}</Span>
  </VStack>
)

const MileageTrackingStatsCard = ({ title, amount, formatAsMoney, breakdown }: MileageTrackingStatsCardProps) => (
  <VStack className='Layer__MileageTrackingStats__Card' gap='3xs'>
    <Span size='md'>{title}</Span>
    {formatAsMoney
      ? <MoneySpan amount={amount} size='lg' weight='bold' />
      : <Span size='lg' weight='bold'>{amount.toLocaleString()}</Span>}
    {breakdown && (
      <HStack gap='md'>
        <MileageTrackingStatsRow label='Business' value={breakdown.business} />
        <MileageTrackingStatsRow label='Personal' value={breakdown.personal} />
        <MileageTrackingStatsRow label='Uncategorized' value={breakdown.uncategorized} />
      </HStack>
    )}
  </VStack>
)

export const MileageTrackingStats = () => {
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
        <DataState status={DataStateStatus.failed} title='Failed to load mileage data' spacing />
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
            title='Total Deduction'
            amount={selectedYearData?.estimatedDeduction ?? 0}
            formatAsMoney
          />
          <MileageTrackingStatsCard
            title='Total Miles'
            amount={selectedYearData?.miles ?? 0}
            breakdown={{
              business: selectedYearData?.businessMiles ?? 0,
              personal: selectedYearData?.personalMiles ?? 0,
              uncategorized: selectedYearData?.uncategorizedMiles ?? 0,
            }}
          />
          <MileageTrackingStatsCard
            title='Trips'
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
