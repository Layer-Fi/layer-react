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

import { createOwnLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { type ColorSelector, type DetailData, type SeriesData } from '@ui/Chart/seriesTypes'
import { VStack } from '@ui/Stack/Stack'
import { type FallbackFillSelector } from '@blocks/DetailedChart/types'

import './detailedChart.scss'

const legacyClassNames = createOwnLegacyClassNames()({
  'Layer__DetailedChart__Header': 'Layer__DetailedChart__header',
  'Layer__DetailedChart__Container': 'Layer__DetailedChart__container',
  'Layer__DetailedChart__CenterLabelTitle': 'Layer__DetailedChart__centerLabelTitle',
  'Layer__DetailedChart__CenterLabelValue': 'Layer__DetailedChart__centerLabelValue',
  'Layer__DetailedChart__CenterLabelShare': 'Layer__DetailedChart__centerLabelShare',
  'Layer__DetailedChart__CenterLabelLoading': 'Layer__DetailedChart__centerLabelLoading',
  'Layer__DetailedChart__Slice': [],
  'Layer__DetailedChart__Slice--Inactive': 'Layer__DetailedChart__Slice--inactive',
})

export type DetailedChartProps<T extends SeriesData> = {
  data: DetailData<T>
  isLoading?: boolean
  interactionProps: {
    hoveredItem: T | undefined
    setHoveredItem: (item: T | undefined) => void
  }
  stylingProps: {
    colorSelector: ColorSelector<T>
    fallbackFillSelector?: FallbackFillSelector<T>
    fallbackFillColor?: string
    innerRadius?: string | number
    outerRadius?: string | number
  }
  slots?: {
    Header?: React.ReactNode
  }
}

const DEFAULT_INNER_RADIUS = '91%'
const DEFAULT_OUTER_RADIUS = '100%'

export const DetailedChart = <T extends SeriesData>({
  data,
  isLoading,
  interactionProps,
  stylingProps,
  slots,
}: DetailedChartProps<T>) => {
  const { t } = useTranslation()
  const { formatPercent, formatCurrencyFromCents } = useIntlFormatter()
  const { data: chartData, total } = data

  const innerRadius = stylingProps.innerRadius ?? DEFAULT_INNER_RADIUS
  const outerRadius = stylingProps.outerRadius ?? DEFAULT_OUTER_RADIUS

  const normalizedChartData = useMemo(() => chartData.map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  }
  )),
  [chartData])

  const text = interactionProps.hoveredItem
    ? interactionProps.hoveredItem.displayName
    : t('common:label.total', 'Total')

  const value = chartData.find(
    x => x.name === interactionProps.hoveredItem?.name,
  )?.value ?? total

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
          maxLines={2}
          width={Math.max(width - 40, 0)}
          className={legacyClassNames('Layer__DetailedChart__CenterLabelTitle')}
        >
          {text}
        </ChartText>
        <ChartText
          y={y + height / 2 + 5}
          x={x + width / 2}
          textAnchor='middle'
          verticalAnchor='middle'
          className={legacyClassNames('Layer__DetailedChart__CenterLabelValue')}
        >
          {formatCurrencyFromCents(value)}
        </ChartText>
        {share != null && (
          <ChartText
            y={y + height / 2 + 25}
            x={x + width / 2}
            textAnchor='middle'
            verticalAnchor='middle'
            className={legacyClassNames('Layer__DetailedChart__CenterLabelShare')}
          >
            {formattedShare}
          </ChartText>
        )}
      </>
    )
  }, [text, value, share, formattedShare, formatCurrencyFromCents])

  return (
    <VStack className='Layer__DetailedChart'>
      {slots?.Header && (
        <VStack className={legacyClassNames('Layer__DetailedChart__Header')}>
          {slots.Header}
        </VStack>
      )}
      <VStack className={legacyClassNames('Layer__DetailedChart__Container')}>
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
                  outerRadius={outerRadius}
                  paddingAngle={0}
                  fill='#F8F8FA'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  <Label position='center' value={t('common:label.loading', 'Loading...')} className={legacyClassNames('Layer__DetailedChart__CenterLabelLoading')} />
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
                  outerRadius={outerRadius}
                  paddingAngle={0.5}
                  fill='#8884d8'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  {normalizedChartData.map((entry, index) => {
                    const colorMapping = stylingProps.colorSelector(entry)
                    const isFallbackSlice = stylingProps.fallbackFillSelector?.(entry) ?? false
                    let fill: string | undefined = colorMapping.color
                    let active = true
                    if (interactionProps.hoveredItem && entry.name !== interactionProps.hoveredItem?.name) {
                      active = false
                      fill = undefined
                    }

                    return (
                      <Cell
                        key={`cell-${index}`}
                        className={classNames(
                          'Layer__DetailedChart__Slice',
                          interactionProps.hoveredItem && !active && legacyClassNames('Layer__DetailedChart__Slice--Inactive'),
                        )}
                        fill={isFallbackSlice && fill
                          ? stylingProps.fallbackFillColor ?? 'url(#layer-pie-dots-pattern)'
                          : fill}
                        opacity={colorMapping.opacity}
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
      </VStack>
    </VStack>
  )
}
