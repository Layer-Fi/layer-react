import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type TaxSummarySectionType } from '@schemas/taxEstimates/summary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'
import { type SeriesData } from '@components/DetailedCharts/types'
import { NO_OP_INTERACTION_PROPS, NO_SORT_PROPS } from '@components/DetailedCharts/utils'
import { DetailedTableWithData } from '@components/DetailedTable/DetailedTable'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { resolveCategoryColor } from '@components/TaxEstimatesSummaryCard/constants'
import { useTaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/useTaxEstimatesSummaryCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxEstimatesSummaryCard.scss'

const LoadingState = () => {
  return (
    <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Content'>
      <SkeletonLoader height='128px' width='128px' isRounded={true} />
      <SkeletonLoader height='24px' width='80%' />
      <SkeletonLoader height='24px' width='80%' />
      <SkeletonLoader height='24px' width='80%' />
    </VStack>
  )
}

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Content'>
      <Span size='lg'>{t('taxEstimates:error.load_tax_estimates_summary', 'We couldn\'t load your tax summary.')}</Span>
    </VStack>
  )
}

export const TaxEstimatesSummaryCard = () => {
  const { isMobile } = useSizeClass()
  const { detailData, layout, title, isLoading, isError } = useTaxEstimatesSummaryCard()
  const isSummaryCardLayout = layout === 'summaryCard'

  const stylingProps = useMemo(() => {
    const colorByKey = detailData.data.reduce<Record<string, string>>((acc, item) => {
      acc[item.name] = resolveCategoryColor({ key: item.name as TaxSummarySectionType })
      return acc
    }, {})

    return ({
      colorSelector: (item: SeriesData) => ({
        color: colorByKey[item.name] ?? 'var(--color-base-300)',
        opacity: 1,
      }),
    })
  }, [detailData.data])

  const commonProps = useMemo(() => ({ interactionProps: NO_OP_INTERACTION_PROPS, stylingProps }), [stylingProps])

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
          <ConditionalBlock data={detailData} isLoading={isLoading} isError={isError} Loading={<LoadingState />} Error={<ErrorState />}>
            {({ data }) => (
              isMobile || isSummaryCardLayout
                ? (
                  <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--mobile' gap='lg'>
                    <DetailedChart<SeriesData> data={data} {...commonProps} />
                    <DetailedTableWithData<SeriesData> data={data} {...commonProps} {...NO_SORT_PROPS} />
                  </VStack>
                )
                : (
                  <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                    <DetailedChart<SeriesData> data={data} {...commonProps} />
                    <DetailedTableWithData<SeriesData> data={data} {...commonProps} {...NO_SORT_PROPS} />
                  </HStack>
                )
            )}
          </ConditionalBlock>
        </VStack>
      </Card>
    </VStack>
  )
}
