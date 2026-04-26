import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type TaxSummarySectionType } from '@schemas/taxEstimates/summary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DetailedChart, type DetailedChartProps } from '@components/DetailedCharts/DetailedChart'
import { type DetailData, type SeriesData } from '@components/DetailedCharts/types'
import { NO_OP_INTERACTION_PROPS, NO_SORT_PROPS } from '@components/DetailedCharts/utils'
import { DetailedTableWithData } from '@components/DetailedTable/DetailedTable'
import { CircleSkeletonLoader, SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { resolveCategoryColor } from '@components/TaxEstimatesSummaryCard/constants'
import { useTaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/useTaxEstimatesSummaryCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxEstimatesSummaryCard.scss'

const LoadingState = () => {
  return (
    <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Content' pb='md' pi='lg' align='center'>
      <CircleSkeletonLoader height='128px' width='128px' />
      <SkeletonLoader height='24px' width='80%' />
      <SkeletonLoader height='24px' width='80%' />
      <SkeletonLoader height='24px' width='80%' />
    </VStack>
  )
}

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <VStack gap='md' className='Layer__TaxEstimatesSummaryCard__Content' pb='md' pi='lg' align='center'>
      <Span size='lg'>{t('taxEstimates:error.load_tax_estimates_summary', 'We couldn\'t load your tax summary')}</Span>
    </VStack>
  )
}

type CommonProps = Pick<DetailedChartProps<SeriesData>, 'interactionProps' | 'stylingProps'>
type ContentProps = {
  data: DetailData<SeriesData>
  commonProps: CommonProps
  layout: 'taxOverview' | 'summaryCard'
}

const Content = ({ data, commonProps, layout }: ContentProps) => {
  const { isMobile } = useSizeClass()
  const isSummaryCardLayout = layout === 'summaryCard'
  return (
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
  )
}

export const TaxEstimatesSummaryCard = () => {
  const { detailData, layout, title, isLoading, isError } = useTaxEstimatesSummaryCard()
  const { isDesktop } = useSizeClass()
  const isSummaryCardLayout = layout === 'summaryCard'

  const commonProps: CommonProps = useMemo(() => {
    const colorByKey = detailData?.data?.reduce<Record<string, string>>((acc, item) => {
      acc[item.name] = resolveCategoryColor({ key: item.name as TaxSummarySectionType })
      return acc
    }, {})

    return {
      interactionProps: NO_OP_INTERACTION_PROPS,
      stylingProps: { colorSelector: (item: SeriesData) => ({ color: colorByKey?.[item.name] ?? 'var(--color-base-300)', opacity: 1 }) },
    }
  }, [detailData?.data])

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
            <Heading size={!isDesktop ? 'sm' : 'md'}>{title}</Heading>
          </HStack>
          <ConditionalBlock data={detailData} isLoading={isLoading} isError={isError} Loading={<LoadingState />} Error={<ErrorState />}>
            {({ data }) => <Content data={data} commonProps={commonProps} layout={layout} />}
          </ConditionalBlock>
        </VStack>
      </Card>
    </VStack>
  )
}
