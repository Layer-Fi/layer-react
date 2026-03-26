import { type ReactNode } from 'react'
import classNames from 'classnames'
import { ArrowUpDown, BellRing } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TaxOverviewCategory, type TaxOverviewNextTax } from '@schemas/taxEstimates/overview'
import { formatPercent } from '@utils/format'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import './taxEstimatesSummaryCard.scss'

type TaxEstimatesOverviewSummaryProps = {
  categories: readonly TaxOverviewCategory[]
  className?: string
  headerAction?: ReactNode
  layout?: 'taxOverview' | 'summaryCard'
  nextTax: TaxOverviewNextTax
  title: string
  total: number
}

const DONUT_RADIUS = 52
const DONUT_STROKE_WIDTH = 12
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
const DONUT_SEGMENT_GAP = 4
const formatDateUtc = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

const getCategoryClassName = (key: TaxOverviewCategory['key']) => {
  switch (key) {
    case 'federal':
      return 'Layer__TaxEstimatesSummaryCard__LegendSwatch--federal'
    case 'state':
      return 'Layer__TaxEstimatesSummaryCard__LegendSwatch--state'
    case 'selfEmployment':
      return 'Layer__TaxEstimatesSummaryCard__LegendSwatch--selfEmployment'
  }
}

const getCategoryStroke = (key: TaxOverviewCategory['key']) => {
  switch (key) {
    case 'federal':
      return '#6D3CC8'
    case 'state':
      return '#D8B8F4'
    case 'selfEmployment':
      return '#1E4D57'
  }
}

const TaxEstimatesSummaryDonutChart = ({
  categories,
  total,
}: Pick<TaxEstimatesOverviewSummaryProps, 'categories' | 'total'>) => {
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

const TaxEstimatesSummaryLegend = ({
  categories,
  isMobile,
  total,
}: Pick<TaxEstimatesOverviewSummaryProps, 'categories' | 'total'> & { isMobile: boolean }) => {
  const { t } = useTranslation()
  const className = isMobile
    ? 'Layer__TaxEstimatesSummaryCard__LegendCard'
    : 'Layer__TaxEstimatesSummaryCard__Legend'

  return (
    <VStack className={className} gap='sm' fluid>
      <HStack justify='space-between' className='Layer__TaxEstimatesSummaryCard__LegendHeader'>
        <Span size='sm' variant='subtle'>{t('common:label.category', 'Category')}</Span>
        <HStack className='Layer__TaxEstimatesSummaryCard__LegendHeaderValue' align='center' gap='2xs'>
          <Span size='sm' variant='subtle'>{t('common:label.value', 'Value')}</Span>
          <ArrowUpDown size={12} />
        </HStack>
      </HStack>
      {categories.map(category => (
        <HStack key={category.key} className='Layer__TaxEstimatesSummaryCard__LegendRow' justify='space-between' align='center' gap='md'>
          <Span size='sm'>{category.label}</Span>
          <HStack className='Layer__TaxEstimatesSummaryCard__LegendValueGroup' align='center' gap='sm'>
            <MoneySpan size='sm' weight='bold' amount={category.amount} />
            <Span size='sm' variant='subtle'>
              {formatPercent(total === 0 ? 0 : category.amount / total)}
              %
            </Span>
            <Span nonAria className={`Layer__TaxEstimatesSummaryCard__LegendSwatch ${getCategoryClassName(category.key)}`} />
          </HStack>
        </HStack>
      ))}
    </VStack>
  )
}

export const TaxEstimatesOverviewSummary = ({
  categories,
  className,
  headerAction,
  layout = 'taxOverview',
  nextTax,
  title,
  total,
}: TaxEstimatesOverviewSummaryProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const isSummaryCardLayout = layout === 'summaryCard'
  const nextPaymentLabel = isMobile
    ? t(
      'taxEstimates:label.next_quarter_due_on_short',
      'Q{{quarter}} due {{date}}',
      {
        quarter: nextTax.quarter,
        date: formatDateUtc(nextTax.dueAt),
      },
    )
    : t(
      'taxEstimates:label.next_quarter_payment_due_on',
      'Q{{quarter}} payment due: {{date}}',
      {
        quarter: nextTax.quarter,
        date: formatDateUtc(nextTax.dueAt),
      },
    )

  return (
    <Card className={classNames('Layer__TaxEstimatesSummaryCard', isSummaryCardLayout && 'Layer__TaxEstimatesSummaryCard--summaryCard', className)}>
      <VStack className='Layer__TaxEstimatesSummaryCard__Body'>
        <HStack
          className={classNames('Layer__TaxEstimatesSummaryCard__Header', isSummaryCardLayout && 'Layer__SummaryCard__ContainerHeader')}
          justify='space-between'
          align={isSummaryCardLayout ? 'center' : 'start'}
          gap='md'
        >
          <Span size='lg' weight='bold'>{title}</Span>
          {headerAction}
        </HStack>
        {(isMobile || isSummaryCardLayout)
          ? (
            <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--mobile' gap='lg'>
              <TaxEstimatesSummaryDonutChart categories={categories} total={total} />
              <TaxEstimatesSummaryLegend categories={categories} total={total} isMobile={isMobile} />
            </VStack>
          )
          : (
            <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
              <TaxEstimatesSummaryDonutChart categories={categories} total={total} />
              <TaxEstimatesSummaryLegend categories={categories} total={total} isMobile={false} />
            </HStack>
          )}
        <HStack className={classNames('Layer__TaxEstimatesSummaryCard__NextPaymentBanner', isSummaryCardLayout && 'Layer__TaxEstimatesSummaryCard__NextPaymentBanner--summaryCard')} justify='space-between' align='center' gap='md'>
          <HStack className='Layer__TaxEstimatesSummaryCard__NextPaymentCopy' align='center' gap='md'>
            {!isMobile && (
              <Span nonAria className='Layer__TaxEstimatesSummaryCard__NextPaymentIcon'>
                <BellRing size={14} />
              </Span>
            )}
            <Span
              className='Layer__TaxEstimatesSummaryCard__NextPaymentText'
              size='sm'
              weight='bold'
              variant='inherit'
            >
              {nextPaymentLabel}
            </Span>
          </HStack>
          <MoneySpan
            size={isMobile ? 'sm' : 'md'}
            weight='bold'
            amount={nextTax.amount}
            variant='inherit'
          />
        </HStack>
      </VStack>
    </Card>
  )
}
