import classNames from 'classnames'

import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'

import './taxEstimatesSummaryCard.scss'

import { DonutChart } from './DonutChart'
import { Legend } from './Legend'

export type TaxEstimatesSummaryCardProps = {
  categories: readonly TaxOverviewCategory[]
  layout?: 'taxOverview' | 'summaryCard'
  title: string
  total: number
}

export const TaxEstimatesSummaryCard = ({
  data,
}: { data: TaxEstimatesSummaryCardProps }) => {
  const { isMobile } = useSizeClass()
  const isSummaryCardLayout = data.layout === 'summaryCard'

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
            <Span size='lg' weight='bold'>{data.title}</Span>
          </HStack>
          {(isMobile || isSummaryCardLayout)
            ? (
              <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--mobile' gap='lg'>
                <DonutChart categories={data.categories} total={data.total} />
                <Legend categories={data.categories} total={data.total} isMobile={isMobile} />
              </VStack>
            )
            : (
              <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                <DonutChart categories={data.categories} total={data.total} />
                <Legend categories={data.categories} total={data.total} isMobile={false} />
              </HStack>
            )}
        </VStack>
      </Card>
    </VStack>
  )
}
