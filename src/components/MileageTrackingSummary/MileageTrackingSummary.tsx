import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/i18n/date/patterns'
import { useMileageTrackingYearlySummary } from '@hooks/features/mileage/useMileageTrackingYearlySummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@providers/WindowSizeStore/WindowSizeStoreProvider'
import { HStack, Stack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'
import { MileageTrackingStatsCard } from '@components/MileageTrackingStats/MileageTrackingStats'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './mileageTrackingSummary.scss'

export type MileageTrackingSummaryProps = {
  header?: string
}

export const MileageTrackingSummary = ({ header: headerOverride }: MileageTrackingSummaryProps = {}) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { data, selectedYear, selectedYearData, chartData, isLoading, isError } = useMileageTrackingYearlySummary()
  const { isDesktop, isMobile } = useSizeClass()
  const inYearLabel = t('mileageTracking:label.in_year', 'In {{year}}', {
    year: formatDate(new Date(selectedYear, 0, 1), DateFormat.Year),
  })
  const title = headerOverride ?? t('mileageTracking:label.mileage_tracking', 'Mileage Tracking')

  const statsProps = isDesktop
    ? { direction: 'column' as const }
    : isMobile ? { direction: 'column' as const } : { direction: 'row' as const }

  return (
    <Container name='mileage-tracking-summary'>
      <VStack className='Layer__MileageTrackingSummary__Header' gap='md'>
        <Heading size={isDesktop ? 'md' : 'sm'}>{title}</Heading>
      </VStack>
      <ConditionalBlock
        data={data}
        isLoading={isLoading}
        isError={isError}
        Loading={(
          <HStack className='Layer__MileageTrackingSummary__Content' gap='lg' justify='center' align='center'>
            <Loader />
          </HStack>
        )}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('mileageTracking:error.load_mileage_summary_data', 'Failed to load mileage summary data')}
            spacing
          />
        )}
      >
        {() => (
          <Stack
            className='Layer__MileageTrackingSummary__Content'
            direction={isDesktop ? 'row' : 'column'}
            gap='lg'
          >
            <Stack {...statsProps} className='Layer__MileageTrackingSummary__Cards' gap='md'>
              <div className='Layer__MileageTrackingSummary__StatCardSlot'>
                <MileageTrackingStatsCard
                  title={t('mileageTracking:label.total_deduction', 'Total Deduction')}
                  amount={selectedYearData?.estimatedDeduction ?? 0}
                  formatAsMoney
                  description={inYearLabel}
                />
              </div>
              <div className='Layer__MileageTrackingSummary__StatCardSlot'>
                <MileageTrackingStatsCard
                  title={t('mileageTracking:label.total_miles', 'Total Miles')}
                  amount={selectedYearData?.miles ?? 0}
                  description={inYearLabel}
                />
              </div>
              <div className='Layer__MileageTrackingSummary__StatCardSlot'>
                <MileageTrackingStatsCard
                  title={t('trips:label.trips', 'Trips')}
                  amount={selectedYearData?.trips ?? 0}
                  description={inYearLabel}
                />
              </div>
            </Stack>
            <VStack className='Layer__MileageTrackingSummary__Chart' fluid justify='end'>
              <MileageDeductionChart data={chartData} selectedYear={selectedYear} chartHeight={isDesktop ? 250 : 200} />
            </VStack>
          </Stack>
        )}
      </ConditionalBlock>
    </Container>
  )
}
