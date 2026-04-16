import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import {
  Cell,
  Label,
  type LabelProps,
  Pie,
  PieChart,
  ResponsiveContainer,
  Text as ChartText,
} from 'recharts'
import type { CartesianViewBox } from 'recharts/types/util/types'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { type ColorSelector, type DetailData, type FallbackFillSelector, type SeriesData, type ValueFormatter } from '@components/DetailedCharts/types'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import './detailedChart.scss'

type DetailedChartStylingProps<T extends SeriesData> = {
  colorSelector: ColorSelector<T>
  fallbackFillSelector?: FallbackFillSelector<T>
  valueFormatter: ValueFormatter
  showDatePicker?: boolean
  isBordered?: boolean
  thickness?: 'sm' | 'md' | 'lg'
}

type DetailedChartInteractionProps<T extends SeriesData> = {
  hoveredItem: T | undefined
  setHoveredItem: (item: T | undefined) => void
}

export type DetailedChartProps<T extends SeriesData> = {
  data: DetailData<T>

  isLoading?: boolean
  isError?: boolean

  interactionProps: DetailedChartInteractionProps<T>
  stylingProps: DetailedChartStylingProps<T>
}

export const DetailedChart = <T extends SeriesData>({
  data,
  isLoading,
  interactionProps,
  stylingProps,
}: DetailedChartProps<T>) => {
  const { t } = useTranslation()
  const { formatPercent } = useIntlFormatter()
  const { data: chartData, total } = data
  const thickness = stylingProps.thickness ?? 'sm'
  const innerRadiusByThickness: Record<'sm' | 'md' | 'lg', string> = {
    sm: '91%',
    md: '86%',
    lg: '80%',
  }
  const innerRadius = innerRadiusByThickness[thickness]

  const normalizedChartData = useMemo(() => chartData.map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  }
  )),
  [chartData])

  const text = interactionProps.hoveredItem
    ? interactionProps.hoveredItem.displayName
    : t('common:label.total', 'Total')

  const value = interactionProps.hoveredItem
    ? chartData.find(
      x => x.name === interactionProps.hoveredItem?.name,
    )?.value
    : total

  let share = null
  if (interactionProps.hoveredItem) {
    const item = chartData.find(
      x => x.name === interactionProps.hoveredItem?.name,
    )
    const positiveTotal = normalizedChartData.reduce((sum, x) => sum + x.value, 0)

    const value = Math.max(item?.value ?? 0, 0)
    share = value > 0 && positiveTotal > 0 ? value / positiveTotal : null
  }

  const formattedShare = useMemo(() => {
    if (share === null) {
      return ''
    }
    const normalizedShare = Math.abs(share) < 0.1 && share !== 0 ? 1 : 0
    return formatPercent(share, {
      maximumFractionDigits: normalizedShare,
    })
  }, [formatPercent, share])

  const renderLabel = useCallback((props: LabelProps) => {
    const { x = 0, y = 0, width = 0, height = 0 } = props.viewBox as CartesianViewBox ?? {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
    return (
      <>
        <ChartText
          y={y + height / 2 - 15}
          x={x + width / 2}
          textAnchor='middle'
          verticalAnchor='middle'
          className='pie-center-label__title'
        >
          {text}
        </ChartText>
        <ChartText
          y={y + height / 2 + 5}
          x={x + width / 2}
          textAnchor='middle'
          verticalAnchor='middle'
          className='pie-center-label__value'
        >
          {stylingProps.valueFormatter(value ?? total)}
        </ChartText>
        {share != null && (
          <ChartText
            y={y + height / 2 + 25}
            x={x + width / 2}
            textAnchor='middle'
            verticalAnchor='middle'
            className='pie-center-label__share'
          >
            {formattedShare}
          </ChartText>
        )}
      </>
    )
  }, [text, value, total, stylingProps, share, formattedShare])

  return (
    <div className='chart-field'>
      <div className='header--tablet'>
        {stylingProps?.showDatePicker && <GlobalMonthPicker />}
      </div>

      <div className='chart-container'>
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <pattern
                id='layer-pie-stripe-pattern'
                x='0'
                y='0'
                width='4'
                height='4'
                patternTransform='rotate(45)'
                patternUnits='userSpaceOnUse'
              >
                <rect width='4' height='4' opacity={0.16} />
                <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
              </pattern>
              <pattern
                id='layer-pie-dots-pattern'
                x='0'
                y='0'
                width='3'
                height='3'
                patternUnits='userSpaceOnUse'
              >
                <rect width='3' height='3' opacity={0.46} className='bg' />
                <rect width='1' height='1' opacity={0.56} />
              </pattern>
            </defs>
            {isLoading
              ? (
                <Pie
                  data={[{ name: 'loading...', value: 1 }]}
                  dataKey='value'
                  nameKey='displayName'
                  cx='50%'
                  cy='50%'
                  innerRadius={innerRadius}
                  outerRadius='100%'
                  paddingAngle={0}
                  fill='#F8F8FA'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  <Label position='center' value='Loading...' className='pie-center-label__loading' />
                </Pie>
              )
              : (
                <Pie
                  data={normalizedChartData}
                  dataKey='value'
                  nameKey='displayName'
                  cx='50%'
                  cy='50%'
                  innerRadius={innerRadius}
                  outerRadius='100%'
                  paddingAngle={0.5}
                  fill='#8884d8'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  {normalizedChartData.map((entry, index) => {
                    let fill: string | undefined = stylingProps.colorSelector(entry)?.color
                    let active = true
                    if (interactionProps.hoveredItem && entry.name !== interactionProps.hoveredItem?.name) {
                      active = false
                      fill = undefined
                    }

                    return (
                      <Cell
                        key={`cell-${index}`}
                        className={classNames(
                          'Layer__profit-and-loss-detailed-charts__pie',
                          interactionProps.hoveredItem && active ? 'active' : 'inactive',
                          stylingProps?.isBordered && 'Layer__profit-and-loss-detailed-charts__pie--border',
                        )}
                        style={{
                          fill:
                          stylingProps.fallbackFillSelector?.(entry) && fill
                            ? 'url(#layer-pie-dots-pattern)'
                            : fill,
                        }}
                        opacity={stylingProps.colorSelector(entry)?.opacity}
                        onMouseEnter={() => interactionProps.setHoveredItem(entry)}
                        onMouseLeave={() => interactionProps.setHoveredItem(undefined)}
                      />
                    )
                  })}
                  <Label position='center' content={renderLabel} />
                </Pie>
              )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
