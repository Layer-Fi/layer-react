import { useTranslation } from 'react-i18next'

import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import {
  DONUT_CIRCUMFERENCE,
  DONUT_RADIUS,
  DONUT_SEGMENT_GAP,
  DONUT_STROKE_WIDTH,
  getCategoryStroke,
} from './constants'
import type { SummaryCardProps } from './types'

type DonutChartProps = Pick<SummaryCardProps, 'categories' | 'total'>

export const DonutChart = ({
  categories,
  total,
}: DonutChartProps) => {
  const { t } = useTranslation()
  let offset = 0

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__DonutChart' align='center' justify='center'>
      <svg className='Layer__TaxEstimatesSummaryCard__DonutChartSvg' viewBox='0 0 140 140' aria-hidden='true' focusable='false'>
        <circle
          className='Layer__TaxEstimatesSummaryCard__DonutChartTrack'
          cx='70'
          cy='70'
          r={DONUT_RADIUS}
          strokeWidth={DONUT_STROKE_WIDTH}
          fill='none'
        />
        {total > 0 && categories.map((category) => {
          const rawSegmentLength = (category.amount / total) * DONUT_CIRCUMFERENCE
          const segmentLength = Math.max(rawSegmentLength - DONUT_SEGMENT_GAP, 0)
          const circle = (
            <circle
              key={category.key}
              cx='70'
              cy='70'
              r={DONUT_RADIUS}
              strokeWidth={DONUT_STROKE_WIDTH}
              fill='none'
              stroke={getCategoryStroke(category.key)}
              strokeDasharray={`${segmentLength} ${DONUT_CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
              strokeLinecap='round'
            />
          )

          offset += rawSegmentLength
          return circle
        })}
      </svg>
      <VStack className='Layer__TaxEstimatesSummaryCard__DonutChartCenter' align='center' justify='center' gap='3xs'>
        <Span size='sm' variant='subtle'>{t('common:label.total', 'Total')}</Span>
        <MoneySpan size='lg' weight='bold' amount={total} />
      </VStack>
    </VStack>
  )
}
