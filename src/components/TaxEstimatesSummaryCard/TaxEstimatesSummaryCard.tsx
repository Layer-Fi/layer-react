import { useMemo } from 'react'
import classNames from 'classnames'

import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
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
  const { isDesktop } = useSizeClass()
  const [viewportWidth] = useWindowSize()
  const isSummaryCardLayout = data.layout === 'summaryCard'
  const isMobile = viewportWidth <= 960

  const Donut = useMemo(() => {
    return <DonutChart categories={data.categories} total={data.total} />
  }, [data.categories, data.total])

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__Container'>
      <Card className={classNames('Layer__TaxEstimatesSummaryCard Layer__TaxEstimatesSummaryCard--summaryCard')}>
        <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Body'>
          <HStack
            className={classNames('Layer__TaxEstimatesSummaryCard__Header', isSummaryCardLayout && 'Layer__SummaryCard__ContainerHeader')}
            justify='space-between'
            align={isSummaryCardLayout ? 'center' : 'start'}
            gap='md'
          >
            <Heading size={!isDesktop ? 'sm' : 'md'}>{data.title}</Heading>
          </HStack>
          {(isMobile || isSummaryCardLayout)
            ? (
              <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--mobile' gap='lg'>
                {Donut}
                <Legend categories={data.categories} total={data.total} />
              </VStack>
            )
            : (
              <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                {Donut}
                <Legend categories={data.categories} total={data.total} />
              </HStack>
            )}
        </VStack>
      </Card>
    </VStack>
  )
}
