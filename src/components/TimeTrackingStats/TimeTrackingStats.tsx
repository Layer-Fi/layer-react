import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { formatMinutesAsDuration } from '@utils/time/timeUtils'
import { type TimeTrackingSummaryFilterParams, useTimeTrackingSummary } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { Loader } from '@components/Loader/Loader'

import './timeTrackingStats.scss'

const SERVICE_COLORS = [
  '#1F4F4C',
  '#DCA900',
  '#B79BD0',
  '#4D9CA3',
  '#D4845A',
  '#8B6BAE',
  '#5C8A4D',
  '#7CB9E0',
]

const CHART_HEIGHT = 24
const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }
const SERVICE_BREAKDOWN_TOP_N = 5
const OTHER_BUCKET_KEY = '__other__'

type ByServiceEntry = {
  serviceId?: string | null
  serviceName?: string | null
  totalMinutes: number
}

type TimeTrackingServiceBreakdown = ByServiceEntry & {
  color: string
  key: string
  percentage: number
  serviceName: string
}

type TimeTrackingStatsProps = {
  selectedFilterParams: TimeTrackingSummaryFilterParams
}

const normalizeByServiceEntry = (entry: unknown): ByServiceEntry | null => {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const encodedEntry = entry as Record<string, unknown>
  const totalMinutes = typeof encodedEntry.totalMinutes === 'number'
    ? encodedEntry.totalMinutes
    : typeof encodedEntry.total_minutes === 'number'
      ? encodedEntry.total_minutes
      : 0

  if (totalMinutes <= 0) {
    return null
  }

  const serviceId = typeof encodedEntry.serviceId === 'string'
    ? encodedEntry.serviceId
    : typeof encodedEntry.id === 'string'
      ? encodedEntry.id
      : null

  const serviceName = typeof encodedEntry.serviceName === 'string'
    ? encodedEntry.serviceName
    : typeof encodedEntry.name === 'string'
      ? encodedEntry.name
      : null

  return {
    serviceId,
    serviceName,
    totalMinutes,
  }
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
  const chartData = useMemo(() => {
    const stackedEntry = entries.reduce<Record<string, number | string>>((acc, entry) => {
      acc[entry.key] = entry.totalMinutes
      return acc
    }, { label: 'services' })

    return [stackedEntry]
  }, [entries])
  const chartTotalMinutes = useMemo(
    () => entries.reduce((total, entry) => total + entry.totalMinutes, 0),
    [entries],
  )

  return (
    <VStack className='Layer__TimeTrackingStats__Chart' gap='md' justify='center'>
      <div className='Layer__TimeTrackingStats__ChartBar'>
        <ResponsiveContainer width='100%' height={CHART_HEIGHT} style={{ padding: 0 }}>
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
              {percentage}
              %
            </Span>
          </VStack>
        ))}
      </HStack>
    </VStack>
  )
})

export const TimeTrackingStats = ({ selectedFilterParams }: TimeTrackingStatsProps) => {
  const { t } = useTranslation()
  const { data: selectedSummary, isLoading: selectedLoading, isError: selectedError } = useTimeTrackingSummary(selectedFilterParams)

  const serviceBreakdown = useMemo<TimeTrackingServiceBreakdown[]>(() => {
    if (!selectedSummary?.byService) {
      return []
    }

    const byService = selectedSummary.byService
      .map(normalizeByServiceEntry)
      .filter((entry): entry is ByServiceEntry => entry !== null)

    const totalMinutes = byService.reduce((total, entry) => total + entry.totalMinutes, 0)

    const sorted = [...byService].sort((a, b) => b.totalMinutes - a.totalMinutes)
    const topEntries = sorted.slice(0, SERVICE_BREAKDOWN_TOP_N)
    const remainder = sorted.slice(SERVICE_BREAKDOWN_TOP_N)

    const rows: TimeTrackingServiceBreakdown[] = topEntries.map((entry, index) => ({
      ...entry,
      color: SERVICE_COLORS[index % SERVICE_COLORS.length],
      key: entry.serviceId ?? `service-${index}`,
      percentage: totalMinutes > 0
        ? Math.round((entry.totalMinutes / totalMinutes) * 100)
        : 0,
      serviceName: entry.serviceName || t('timeTracking:label.other', 'Other'),
    }))

    if (remainder.length > 0) {
      const otherMinutes = remainder.reduce((sum, entry) => sum + entry.totalMinutes, 0)
      const otherIndex = topEntries.length
      rows.push({
        serviceId: null,
        serviceName: t('timeTracking:label.other', 'Other'),
        totalMinutes: otherMinutes,
        color: SERVICE_COLORS[otherIndex % SERVICE_COLORS.length],
        key: OTHER_BUCKET_KEY,
        percentage: totalMinutes > 0
          ? Math.round((otherMinutes / totalMinutes) * 100)
          : 0,
      })
    }

    return rows
  }, [selectedSummary, t])

  if (selectedError) {
    return (
      <Container name='time-tracking-stats'>
        <DataState status={DataStateStatus.failed} title={t('timeTracking:error.load_summary', 'Failed to load time tracking summary')} spacing />
      </Container>
    )
  }

  if (selectedLoading || !selectedSummary) {
    return (
      <Container name='time-tracking-stats'>
        <HStack className='Layer__TimeTrackingStats__Content' gap='lg' justify='center' align='center'>
          <Loader />
        </HStack>
      </Container>
    )
  }

  return (
    <Container name='time-tracking-stats'>
      <VStack className='Layer__TimeTrackingStats__Content' gap='lg'>
        <HStack className='Layer__TimeTrackingStats__TopRow' justify='space-between' align='center' gap='lg'>
          <VStack className='Layer__TimeTrackingStats__Summary' gap='2xs'>
            <Span size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
            <Span className='Layer__TimeTrackingStats__SummaryValue' size='xl' weight='bold'>
              {formatMinutesAsDuration(selectedSummary.totalMinutes, { compact: true })}
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
    </Container>
  )
}
