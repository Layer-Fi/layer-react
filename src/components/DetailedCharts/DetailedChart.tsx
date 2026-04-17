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
import { VStack } from '@ui/Stack/Stack'
import { type ColorSelector, type DetailData, type FallbackFillSelector, type SeriesData } from '@components/DetailedCharts/types'

import './detailedChart.scss'

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
  }
  slots?: {
    Header?: React.ReactNode
  }
}

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
          className='Layer__DetailedChart__centerLabelTitle'
        >
          {text}
        </ChartText>
        <ChartText
          y={y + height / 2 + 5}
          x={x + width / 2}
          textAnchor='middle'
          verticalAnchor='middle'
          className='Layer__DetailedChart__centerLabelValue'
        >
          {formatCurrencyFromCents(value)}
        </ChartText>
        {share != null && (
          <ChartText
            y={y + height / 2 + 25}
            x={x + width / 2}
            textAnchor='middle'
            verticalAnchor='middle'
            className='Layer__DetailedChart__centerLabelShare'
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
        <VStack className='Layer__DetailedChart__header'>
          {slots.Header}
        </VStack>
      )}
      <VStack className='Layer__DetailedChart__container'>
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
                  innerRadius='91%'
                  outerRadius='100%'
                  paddingAngle={0}
                  fill='#F8F8FA'
                  animationDuration={200}
                  animationEasing='ease-in-out'
                >
                  <Label position='center' value={t('common:label.loading', 'Loading...')} className='Layer__DetailedChart__centerLabelLoading' />
                </Pie>
              )
              : (
                <Pie
                  data={normalizedChartData}
                  dataKey='value'
                  nameKey='displayName'
                  cx='50%'
                  cy='50%'
                  innerRadius='91%'
                  outerRadius='100%'
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
                          'Layer__DetailedChart__slice',
                          interactionProps.hoveredItem && !active && 'Layer__DetailedChart__slice--inactive',
                        )}
                        fill={isFallbackSlice && fill
                          ? 'url(#layer-pie-dots-pattern)'
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
