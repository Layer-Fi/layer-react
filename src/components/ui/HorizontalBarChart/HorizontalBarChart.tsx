import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, Stack, VStack } from '@ui/Stack/Stack'
import { Swatch } from '@ui/Swatch/Swatch'
import { Span } from '@ui/Typography/Text'
import {
  type ColorSelector,
  DEFAULT_TYPE_COLOR_MAPPING,
  type DetailData,
  type SeriesData,
} from '@components/DetailedCharts/types'

import './horizontalBarChart.scss'

const CHART_HEIGHT = 24
const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }
const CHART_BORDER_RADIUS = 8

export type HorizontalBarChartLabelMode = 'table' | 'aligned'

export type HorizontalBarChartProps<T extends SeriesData> = {
  data: DetailData<T>
  stylingProps: {
    colorSelector: ColorSelector<T>
  }
  formatValue: (value: number) => string
  showLegend?: boolean
  labelMode?: HorizontalBarChartLabelMode
}

export const HorizontalBarChart = <T extends SeriesData>({
  data,
  stylingProps,
  formatValue,
  showLegend = true,
  labelMode = 'table',
}: HorizontalBarChartProps<T>) => {
  const { formatPercent } = useIntlFormatter()
  const { data: items, total } = data

  const positiveItems = useMemo(
    () => items.filter(item => item.value > 0),
    [items],
  )

  const positiveTotal = positiveItems.reduce((sum, item) => sum + item.value, 0)

  const chartData = useMemo(() => {
    const stacked = positiveItems.reduce<Record<string, number | string>>(
      (acc, item) => {
        acc[item.name] = item.value
        return acc
      },
      { label: 'series' },
    )
    return [stacked]
  }, [positiveItems])

  const chartKey = positiveItems.map(item => item.name).join('|')

  return (
    <VStack className='Layer__HorizontalBarChart' gap='md' justify='center'>
      <div className='Layer__HorizontalBarChart__Bar'>
        <ResponsiveContainer key={chartKey} width='100%' height={CHART_HEIGHT}>
          <BarChart
            data={chartData}
            layout='vertical'
            margin={CHART_MARGIN}
            barCategoryGap='0%'
            barGap={0}
            barSize={CHART_HEIGHT}
          >
            <XAxis type='number' hide domain={[0, Math.max(positiveTotal, 1)]} allowDataOverflow />
            <YAxis type='category' dataKey='label' hide width={0} />
            {positiveItems.map((item, index) => {
              const isFirstSegment = index === 0
              const isLastSegment = index === positiveItems.length - 1
              const { color, opacity } = stylingProps.colorSelector(item) ?? DEFAULT_TYPE_COLOR_MAPPING
              return (
                <Bar
                  key={item.name}
                  dataKey={item.name}
                  barSize={CHART_HEIGHT}
                  fill={color}
                  fillOpacity={opacity}
                  stackId='horizontal-bar-chart'
                  isAnimationActive={false}
                  radius={[
                    isFirstSegment ? CHART_BORDER_RADIUS : 0,
                    isLastSegment ? CHART_BORDER_RADIUS : 0,
                    isLastSegment ? CHART_BORDER_RADIUS : 0,
                    isFirstSegment ? CHART_BORDER_RADIUS : 0,
                  ]}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {showLegend && labelMode === 'table' && (
        <Stack
          direction='row'
          className='Layer__HorizontalBarChart__Legend'
          gap='lg'
          align='start'
        >
          {positiveItems.map((item) => {
            const { color, opacity } = stylingProps.colorSelector(item) ?? DEFAULT_TYPE_COLOR_MAPPING
            const denominator = positiveTotal > 0 ? positiveTotal : total
            const percentage = denominator > 0 ? item.value / denominator : 0
            return (
              <VStack key={item.name} className='Layer__HorizontalBarChart__LegendItem' gap='2xs'>
                <HStack className='Layer__HorizontalBarChart__LegendLabel' gap='2xs' align='center'>
                  <Swatch color={color} opacity={opacity} />
                  <Span size='md' ellipsis withTooltip>{item.displayName}</Span>
                </HStack>
                <HStack className='Layer__HorizontalBarChart__LegendMeta' gap='2xs' align='baseline'>
                  <Span className='Layer__HorizontalBarChart__LegendValue' size='sm'>
                    {formatValue(item.value)}
                  </Span>
                  <Span className='Layer__HorizontalBarChart__LegendPercentage' size='sm' variant='subtle'>
                    {formatPercent(percentage, { maximumFractionDigits: 0 })}
                  </Span>
                </HStack>
              </VStack>
            )
          })}
        </Stack>
      )}
      {showLegend && labelMode === 'aligned' && (
        <div className='Layer__HorizontalBarChart__AlignedLegend'>
          {positiveItems.map((item) => {
            const denominator = positiveTotal > 0 ? positiveTotal : total
            const percentage = denominator > 0 ? item.value / denominator : 0
            const flexGrow = positiveTotal > 0 ? item.value / positiveTotal : 1
            const intentionalStyleOverrideForDynamicFlexGrow = { display: 'flex', flexDirection: 'column' as const, flexGrow, flexBasis: 0 }
            return (
              <div
                key={item.name}
                className='Layer__HorizontalBarChart__AlignedLegendItem'
                style={intentionalStyleOverrideForDynamicFlexGrow}
              >
                <Span size='sm' variant='subtle' ellipsis withTooltip>{item.displayName}</Span>
                <Span size='lg' className='Layer__HorizontalBarChart__AlignedLegendValue' weight='bold'>
                  {formatValue(item.value)}
                </Span>
                <Span size='sm' variant='subtle'>
                  {formatPercent(percentage, { maximumFractionDigits: 0 })}
                </Span>
              </div>
            )
          })}
        </div>
      )}
    </VStack>
  )
}
