import { useTranslation } from 'react-i18next'

import { useMileageTrackingYearlySummary } from '@hooks/features/mileage/useMileageTrackingYearlySummary'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Container } from '@blocks/Layout/Container/Container'
import { MileageDeductionChart } from '@features/mileage/MileageDeductionChart/MileageDeductionChart'
import { MileageTrackingStatsCard } from '@features/mileage/MileageTrackingStatsCard/MileageTrackingStatsCard'

import './mileageTrackingStats.scss'

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
