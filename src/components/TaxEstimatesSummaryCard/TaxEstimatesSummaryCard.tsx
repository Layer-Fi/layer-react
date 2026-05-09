import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type TaxSummarySectionType } from '@schemas/taxEstimates/summary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HorizontalBarChart } from '@ui/HorizontalBarChart/HorizontalBarChart'
import { LegendLayout } from '@ui/Legend/Legend'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
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

function allTaxSectionsAreEmpty(summary: DetailData<SeriesData>) {
  const isEmpty = summary.data.every(section => section.value === 0)
  return isEmpty
}

function TaxEstimatesSummaryCardEmpty() {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.info}
      title={t('taxEstimates:empty.no_tax_estimates_summary', 'Get started with your tax estimates')}
      description={t('taxEstimates:empty.no_tax_estimates_summary_description', 'Start by importing and categorizing your bank transactions')}
      spacing
    />
  )
}

type CommonProps = Pick<DetailedChartProps<SeriesData>, 'interactionProps' | 'stylingProps'>

export enum TaxEstimatesSummaryCardMode {
  PieChart = 'PieChart',
  HorizontalBarChart = 'HorizontalBarChart',
}

type ContentProps = {
  data: DetailData<SeriesData>
  mode: TaxEstimatesSummaryCardMode
  commonProps: CommonProps
  layout: 'taxOverview' | 'summaryCard'
}

const Content = ({ data, mode, commonProps, layout }: ContentProps) => {
  if (mode === TaxEstimatesSummaryCardMode.HorizontalBarChart) {
    return <HorizontalBarChartContent data={data} commonProps={commonProps} />
  }
  return <PieChartContent data={data} commonProps={commonProps} layout={layout} />
}

const HorizontalBarChartContent = ({ data, commonProps }: Pick<ContentProps, 'data' | 'commonProps'>) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--horizontal' gap='md'>
      <HStack className='Layer__TaxEstimatesSummaryCard__TotalRow' justify='space-between' align='baseline' gap='md'>
        <Span size='md' variant='subtle'>{t('common:label.total', 'Total')}</Span>
        <Span size='xl' weight='bold' className='Layer__TaxEstimatesSummaryCard__TotalValue'>
          {formatCurrencyFromCents(data.total)}
        </Span>
      </HStack>
      <HorizontalBarChart<SeriesData>
        data={data}
        stylingProps={commonProps.stylingProps}
        formatValue={formatCurrencyFromCents}
        labelMode={LegendLayout.Aligned}
      />
    </VStack>
  )
}

const PieChartContent = ({ data, commonProps, layout }: Pick<ContentProps, 'data' | 'commonProps' | 'layout'>) => {
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

export type TaxEstimatesSummaryCardProps = {
  mode?: TaxEstimatesSummaryCardMode
  title?: string
  withHeaderSeparator?: boolean
}

export const TaxEstimatesSummaryCard = ({
  mode = TaxEstimatesSummaryCardMode.PieChart,
  title: titleOverride,
  withHeaderSeparator = false,
}: TaxEstimatesSummaryCardProps = {}) => {
  const { detailData, layout, title: defaultTitle, isLoading, isError } = useTaxEstimatesSummaryCard()
  const { isDesktop } = useSizeClass()
  const isSummaryCardLayout = layout === 'summaryCard'
  const title = titleOverride ?? defaultTitle

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
            className={classNames(
              'Layer__TaxEstimatesSummaryCard__Header',
              (isSummaryCardLayout || withHeaderSeparator) && 'Layer__SummaryCard__ContainerHeader',
            )}
            justify='space-between'
            align={isSummaryCardLayout ? 'center' : 'start'}
            gap='md'
          >
            <Heading size={!isDesktop ? 'sm' : 'md'}>{title}</Heading>
          </HStack>
          <ConditionalBlock data={detailData} isLoading={isLoading} isError={isError} Loading={<LoadingState />} Error={<ErrorState />}>
            {({ data }) => allTaxSectionsAreEmpty(data)
              ? <TaxEstimatesSummaryCardEmpty />
              : <Content data={data} mode={mode} commonProps={commonProps} layout={layout} />}
          </ConditionalBlock>
        </VStack>
      </Card>
    </VStack>
  )
}
