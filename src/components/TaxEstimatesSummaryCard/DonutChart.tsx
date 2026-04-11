import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import {
  DONUT_INNER_RADIUS,
  DONUT_OUTER_RADIUS,
  DONUT_PADDING_ANGLE,
  DONUT_STROKE_WIDTH,
  resolveCategoryColor,
} from './constants'
import type { SummaryCardProps } from './types'

type DonutChartProps = Pick<SummaryCardProps, 'categories' | 'total'>

export const DonutChart = ({
  categories,
  total,
}: DonutChartProps) => {
  const { t } = useTranslation()
  const chartData = useMemo(() => {
    if (total <= 0) return []

    return categories
      .map(category => ({
        ...category,
        value: Math.max(category.amount, 0),
      }))
      .filter(category => category.value > 0)
  }, [categories, total])

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__DonutChart' align='center' justify='center'>
      <ResponsiveContainer className='Layer__TaxEstimatesSummaryCard__DonutChartPie' width='100%' height='100%'>
        <PieChart>
          <Pie
            data={[{ key: 'track', value: 1 }]}
            dataKey='value'
            cx='50%'
            cy='50%'
            startAngle={90}
            endAngle={-270}
            innerRadius={DONUT_INNER_RADIUS}
            outerRadius={DONUT_OUTER_RADIUS}
            fill='var(--color-base-100)'
            stroke='none'
            isAnimationActive={false}
          />
          <Pie
            data={chartData}
            dataKey='value'
            nameKey='label'
            cx='50%'
            cy='50%'
            startAngle={90}
            endAngle={-270}
            innerRadius={DONUT_INNER_RADIUS}
            outerRadius={DONUT_OUTER_RADIUS}
            paddingAngle={chartData.length > 1 ? DONUT_PADDING_ANGLE : 0}
            cornerRadius={DONUT_STROKE_WIDTH / 2}
            fill='#8884d8'
            stroke='none'
            isAnimationActive={false}
          >
            {chartData.map(category => (
              <Cell
                key={category.key}
                fill={resolveCategoryColor(category)}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <VStack className='Layer__TaxEstimatesSummaryCard__DonutChartCenter' align='center' justify='center' gap='3xs'>
        <Span size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
        <MoneySpan size='lg' weight='bold' amount={total} />
      </VStack>
    </VStack>
  )
}
