import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { type TimeEntrySummary, type TimeEntrySummaryGroup } from '@schemas/timeTracking'
import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import { type TimeTrackingSummaryFilterParams, useTimeTrackingSummary } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { Loader } from '@components/Loader/Loader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './timeTrackingStats.scss'

const CHART_HEIGHT = 24
const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }

type TimeTrackingServiceBreakdown = {
  color: string
  key: string
  totalMinutes: number
  percentage: number
  serviceName: string
}

type TimeTrackingStatsProps = {
  selectedFilterParams: TimeTrackingSummaryFilterParams
}

function buildServiceBreakdown(
  byService: ReadonlyArray<TimeEntrySummaryGroup>,
  otherLabel: string,
): TimeTrackingServiceBreakdown[] {
  const positive = byService.filter(entry => entry.totalMinutes > 0)
  const totalMinutes = positive.reduce((total, entry) => total + entry.totalMinutes, 0)

  return [...positive]
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .map((entry, index) => ({
      color: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
      key: entry.id ?? `service-${index}`,
      totalMinutes: entry.totalMinutes,
      percentage: totalMinutes > 0 ? entry.totalMinutes / totalMinutes : 0,
      serviceName: entry.name || otherLabel,
    }))
}

function buildStackedChartData(entries: TimeTrackingServiceBreakdown[]) {
  const stackedEntry = entries.reduce<Record<string, number | string>>(
    (acc, entry) => {
      acc[entry.key] = entry.totalMinutes
      return acc
    },
    { label: 'services' },
  )
  return [stackedEntry]
}

const TimeTrackingStatsLegendSwatch = ({ color }: { color: string }) => (
  <svg
    aria-hidden
    className='Layer__TimeTrackingStats__LegendSwatch'
    viewBox='0 0 10 10'
  >
    <circle cx='5' cy='5' r='5' fill={color} />
  </svg>
)

const TimeTrackingStatsBreakdown = memo(function TimeTrackingStatsBreakdown({ entries }: { entries: TimeTrackingServiceBreakdown[] }) {
  const { formatMinutesAsDuration, formatPercent } = useIntlFormatter()
  const chartData = useMemo(() => buildStackedChartData(entries), [entries])
  const chartTotalMinutes = useMemo(
    () => entries.reduce((total, entry) => total + entry.totalMinutes, 0),
    [entries],
  )

  return (
    <VStack className='Layer__TimeTrackingStats__Chart' gap='md' justify='center'>
      <div className='Layer__TimeTrackingStats__ChartBar'>
        <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
          <BarChart
            data={chartData}
            layout='vertical'
            margin={CHART_MARGIN}
            barCategoryGap='0%'
            barGap={0}
            barSize={CHART_HEIGHT}
          >
            <XAxis type='number' hide domain={[0, Math.max(chartTotalMinutes, 1)]} allowDataOverflow />
            <YAxis type='category' dataKey='label' hide width={0} />
            {entries.map(({ color, key }) => (
              <Bar
                key={key}
                dataKey={key}
                barSize={CHART_HEIGHT}
                fill={color}
                stackId='time-tracking-services'
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <HStack className='Layer__TimeTrackingStats__Legend' gap='lg' align='start'>
        {entries.map(({ color, key, percentage, serviceName, totalMinutes }) => (
          <VStack key={key} className='Layer__TimeTrackingStats__LegendItem' gap='2xs'>
            <HStack gap='2xs' align='center'>
              <TimeTrackingStatsLegendSwatch color={color} />
              <Span size='md'>{serviceName}</Span>
            </HStack>
            <Span size='xl' weight='bold'>{formatMinutesAsDuration(totalMinutes, { compact: true })}</Span>
            <Span size='sm' variant='subtle'>
              {formatPercent(percentage, { maximumFractionDigits: 0 })}
            </Span>
          </VStack>
        ))}
      </HStack>
    </VStack>
  )
})

function TimeTrackingStatsContent({ summary }: { summary: TimeEntrySummary }) {
  const { t } = useTranslation()
  const { formatMinutesAsDuration } = useIntlFormatter()

  const serviceBreakdown = useMemo(
    () => buildServiceBreakdown(summary.byService, t('timeTracking:label.other', 'Other')),
    [summary.byService, t],
  )

  return (
    <VStack className='Layer__TimeTrackingStats__Content' gap='lg'>
      <HStack className='Layer__TimeTrackingStats__TopRow' justify='space-between' align='center' gap='lg'>
        <VStack className='Layer__TimeTrackingStats__Summary' gap='2xs'>
          <Span size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
          <Span className='Layer__TimeTrackingStats__SummaryValue' size='xl' weight='bold'>
            {formatMinutesAsDuration(summary.totalMinutes, { compact: true })}
          </Span>
        </VStack>
        <VStack className='Layer__TimeTrackingStats__DateSelection'>
          <CombinedDateRangeSelection mode='full' showLabels={false} />
        </VStack>
      </HStack>
      {serviceBreakdown.length > 0
        ? (
          <TimeTrackingStatsBreakdown entries={serviceBreakdown} />
        )
        : (
          <VStack className='Layer__TimeTrackingStats__Chart' gap='md' justify='center'>
            <HStack className='Layer__TimeTrackingStats__ChartBar Layer__TimeTrackingStats__ChartBar--empty' />
            <Span size='sm' variant='subtle'>
              {t('timeTracking:label.no_activity_breakdown', 'No activity breakdown available for this period.')}
            </Span>
          </VStack>
        )}
    </VStack>
  )
}

export const TimeTrackingStats = ({ selectedFilterParams }: TimeTrackingStatsProps) => {
  const { t } = useTranslation()
  const { data: summary, isLoading, isError } = useTimeTrackingSummary(selectedFilterParams)

  return (
    <Container name='time-tracking-stats'>
      <ConditionalBlock
        data={summary}
        isLoading={isLoading}
        isError={isError}
        Loading={(
          <HStack className='Layer__TimeTrackingStats__Content' gap='lg' justify='center' align='center'>
            <Loader />
          </HStack>
        )}
        Inactive={null}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('timeTracking:error.load_summary', 'Failed to load time tracking summary')}
            spacing
          />
        )}
      >
        {({ data }) => <TimeTrackingStatsContent summary={data} />}
      </ConditionalBlock>
    </Container>
  )
}
