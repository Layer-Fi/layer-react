import { type ReactNode, useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { Legend, LegendLayout } from '@ui/Legend/Legend'
import { VStack } from '@ui/Stack/Stack'
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
const Y_AXIS_CATEGORY_KEY = '__layer_hbar_category'
const SMALL_SEGMENT_THRESHOLD = 0.25

function determineLabelMode(requestedLabelMode: LegendLayout, positiveItems: SeriesData[], legendDenominator: number): LegendLayout {
  if (legendDenominator <= 0) return LegendLayout.Table

  const hasSmallSegment = positiveItems.some(
    item => item.value / legendDenominator < SMALL_SEGMENT_THRESHOLD,
  )

  if (hasSmallSegment) return LegendLayout.Table
  return requestedLabelMode
}
export type HorizontalBarChartLabelMode = LegendLayout

export type HorizontalBarChartProps<T extends SeriesData> = {
  data: DetailData<T>
  stylingProps: {
    colorSelector: ColorSelector<T>
  }
  formatValue: (value: number) => string
  showLegend?: boolean
  labelMode?: HorizontalBarChartLabelMode
  slots?: {
    Legend?: ReactNode
  }
}

export const HorizontalBarChart = <T extends SeriesData>({
  data,
  stylingProps,
  formatValue,
  showLegend = true,
  labelMode = LegendLayout.Table,
  slots,
}: HorizontalBarChartProps<T>) => {
  const { data: items, total } = data

  const positiveItems = useMemo(
    () => items.filter(item => item.value > 0),
    [items],
  )

  const positiveTotal = positiveItems.reduce((sum, item) => sum + item.value, 0)
  const legendDenominator = positiveTotal > 0 ? positiveTotal : total

  const effectiveLabelMode = determineLabelMode(labelMode, positiveItems, legendDenominator)

  const chartData = useMemo(() => {
    const stacked = positiveItems.reduce<Record<string, number | string>>(
      (acc, item) => {
        acc[item.name] = item.value
        return acc
      },
      { [Y_AXIS_CATEGORY_KEY]: 'series' },
    )
    return [stacked]
  }, [positiveItems])

  const chartKey = positiveItems.map(item => item.name).join('|')

  const legendNode = slots?.Legend !== undefined
    ? slots.Legend
    : (
      <Legend<T>
        items={positiveItems}
        total={legendDenominator}
        colorSelector={stylingProps.colorSelector}
        formatValue={formatValue}
        layout={effectiveLabelMode}
      />
    )

  return (
    <VStack className='Layer__HorizontalBarChart Layer__UI__Chart--focusReset' gap='md' justify='center'>
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
            <XAxis type='number' hide domain={[0, positiveTotal > 0 ? positiveTotal : 1]} allowDataOverflow />
            <YAxis type='category' dataKey={Y_AXIS_CATEGORY_KEY} hide width={0} />
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
      {showLegend && legendNode}
    </VStack>
  )
}
