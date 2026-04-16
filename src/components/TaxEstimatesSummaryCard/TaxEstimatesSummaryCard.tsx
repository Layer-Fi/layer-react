import classNames from 'classnames'

import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import './taxEstimatesSummaryCard.scss'

import { Legend } from './Legend'
import { TaxEstimateChart } from './TaxEstimateChart'

export type TaxEstimatesSummaryCardProps = {
  categories: readonly TaxOverviewCategory[]
  layout?: 'taxOverview' | 'summaryCard'
  title: string
  total: number
}

export const TaxEstimatesSummaryCard = (data: TaxEstimatesSummaryCardProps) => {
  const { isMobile } = useSizeClass()
  const { categories, layout, title, total } = data
  const isSummaryCardLayout = layout === 'summaryCard'

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__Container'>
      <Card className={classNames('Layer__TaxEstimatesSummaryCard', isSummaryCardLayout && 'Layer__TaxEstimatesSummaryCard--summaryCard')}>
        <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Body'>
          <HStack
            className={classNames('Layer__TaxEstimatesSummaryCard__Header', isSummaryCardLayout && 'Layer__SummaryCard__ContainerHeader')}
            justify='space-between'
            align={isSummaryCardLayout ? 'center' : 'start'}
            gap='md'
          >
            <Span size='lg' weight='bold'>{title}</Span>
          </HStack>
          {(isMobile || isSummaryCardLayout)
            ? (
              <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--mobile' gap='lg'>
                <TaxEstimateChart categories={categories} total={total} />
                <Legend categories={categories} total={total} />
              </VStack>
            )
            : (
              <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                <TaxEstimateChart categories={categories} total={total} />
                <Legend categories={categories} total={total} />
              </HStack>
            )}
        </VStack>
      </Card>
    </VStack>
  )
}
