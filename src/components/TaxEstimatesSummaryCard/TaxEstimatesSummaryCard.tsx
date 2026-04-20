import { useMemo } from 'react'
import classNames from 'classnames'

import { type TaxOverviewCategoryKey } from '@schemas/taxEstimates/overview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'
import { type SeriesData } from '@components/DetailedCharts/types'
import { NoOpHoverInteractionProps, NoSortProps } from '@components/DetailedCharts/utils'
import { DetailedTableWithData } from '@components/DetailedTable/DetailedTable'
import { resolveCategoryColor } from '@components/TaxEstimatesSummaryCard/constants'
import { useTaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/useTaxEstimatesSummaryCard'

import './taxEstimatesSummaryCard.scss'

export const TaxEstimatesSummaryCard = () => {
  const { isMobile } = useSizeClass()
  const { detailData, layout, title } = useTaxEstimatesSummaryCard()
  const isSummaryCardLayout = layout === 'summaryCard'

  const StylingProps = useMemo(() => {
    const colorByKey = detailData.data.reduce<Record<string, string>>((acc, item) => {
      acc[item.name] = resolveCategoryColor({ key: item.name as TaxOverviewCategoryKey })
      return acc
    }, {})

    return ({
      colorSelector: (item: SeriesData) => ({
        color: colorByKey[item.name] ?? 'var(--color-base-300)',
        opacity: 1,
      }),
    })
  }, [detailData.data])

  const CommonProps = useMemo(() => ({ data: detailData, interactionProps: NoOpHoverInteractionProps, stylingProps: StylingProps }), [detailData, StylingProps])

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
                <DetailedChart<SeriesData> {...CommonProps} />
                <DetailedTableWithData<SeriesData> {...CommonProps} {...NoSortProps} />
              </VStack>
            )
            : (
              <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                <DetailedChart {...CommonProps} />
                <DetailedTableWithData<SeriesData> {...CommonProps} {...NoSortProps} />
              </HStack>
            )}
        </VStack>
      </Card>
    </VStack>
  )
}
