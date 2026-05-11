import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/i18n/date/patterns'
import { useMileageTrackingYearlySummary } from '@hooks/features/mileage/useMileageTrackingYearlySummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, Stack, VStack } from '@ui/Stack/Stack'
import { SummaryCard } from '@ui/SummaryCard/SummaryCard'
import { type SummaryCardInteractionProps, type SummaryCardStringOverrides, useSummaryCardSlots } from '@ui/SummaryCard/useSummaryCardSlots'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { MileageDeductionChart } from '@components/MileageDeductionChart/MileageDeductionChart'
import { MileageTrackingStatsCard } from '@components/MileageTrackingStats/MileageTrackingStats'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './mileageTrackingSummary.scss'

const Content = () => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const { data, selectedYear, selectedYearData, chartData, isLoading, isError } = useMileageTrackingYearlySummary()
  const { isDesktop, isMobile } = useSizeClass()
  const inYearLabel = t('mileageTracking:label.in_year', 'In {{year}}', {
    year: formatDate(new Date(selectedYear, 0, 1), DateFormat.Year),
  })

  const statsProps = isDesktop
    ? { direction: 'column' as const }
    : isMobile ? { direction: 'column' as const } : { direction: 'row' as const }

  return (
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
  )
}

export type MileageTrackingSummaryProps = {
  stringOverrides?: SummaryCardStringOverrides
  interactionProps?: SummaryCardInteractionProps
}

export const MileageTrackingSummary = ({ stringOverrides, interactionProps }: MileageTrackingSummaryProps = {}) => {
  const { t } = useTranslation()
  const slots = useSummaryCardSlots({
    defaultTitle: t('mileageTracking:label.mileage_tracking', 'Mileage Tracking'),
    interactionProps,
    stringOverrides,
  })

  return (
    <SummaryCard className='Layer__MileageTrackingSummary' slots={slots}>
      <Content />
    </SummaryCard>
  )
}
