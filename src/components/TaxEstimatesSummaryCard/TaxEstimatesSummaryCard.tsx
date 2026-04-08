import classNames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import './taxEstimatesSummaryCard.scss'

import { DonutChart } from './DonutChart'
import { Legend } from './Legend'
import { NextPaymentBanner } from './NextPaymentBanner'
import type { SummaryCardProps } from './types'

export const TaxEstimatesSummaryCard = ({
  categories,
  className,
  headerAction,
  layout = 'taxOverview',
  nextTax,
  title,
  total,
}: SummaryCardProps) => {
  const { isMobile } = useSizeClass()
  const isSummaryCardLayout = layout === 'summaryCard'

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__Container'>
      <Card className={classNames('Layer__TaxEstimatesSummaryCard', isSummaryCardLayout && 'Layer__TaxEstimatesSummaryCard--summaryCard', className)}>
        <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Body'>
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
                <DonutChart categories={categories} total={total} />
                <Legend categories={categories} total={total} isMobile={isMobile} />
              </VStack>
            )
            : (
              <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                <DonutChart categories={categories} total={total} />
                <Legend categories={categories} total={total} isMobile={false} />
              </HStack>
            )}
          <NextPaymentBanner
            isSummaryCardLayout={isSummaryCardLayout}
            isMobile={isMobile}
            nextTax={nextTax}
          />
        </VStack>
      </Card>
    </VStack>
  )
}
