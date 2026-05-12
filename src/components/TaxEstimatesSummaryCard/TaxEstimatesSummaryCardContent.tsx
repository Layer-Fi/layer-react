import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type TaxSummarySectionType, TaxSummaryState } from '@schemas/taxEstimates/summary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HorizontalBarChart } from '@ui/HorizontalBarChart/HorizontalBarChart'
import { LegendLayout } from '@ui/Legend/Legend'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { DetailedChart, type DetailedChartProps } from '@components/DetailedCharts/DetailedChart'
import { type DetailData, type SeriesData } from '@components/DetailedCharts/types'
import { NO_OP_INTERACTION_PROPS, NO_SORT_PROPS } from '@components/DetailedCharts/utils'
import { DetailedTableWithData } from '@components/DetailedTable/DetailedTable'
import { resolveCategoryColor, TaxEstimatesSummaryCardMode } from '@components/TaxEstimatesSummaryCard/constants'
import { TaxEstimatesSummaryCardEmpty } from '@components/TaxEstimatesSummaryCard/states/TaxEstimatesSummaryCardEmpty'
import { TaxEstimatesSummaryCardNegativeOrZero } from '@components/TaxEstimatesSummaryCard/states/TaxEstimatesSummaryCardNegativeOrZero'

type CommonProps = Pick<DetailedChartProps<SeriesData>, 'interactionProps' | 'stylingProps'>

export type ContentProps = {
  state: TaxSummaryState
  data: DetailData<SeriesData>
  mode: TaxEstimatesSummaryCardMode
  commonProps: CommonProps
  layout: 'taxOverview' | 'summaryCard'
}

export const Content = ({ state, data, mode, layout }: Omit<ContentProps, 'commonProps'>) => {
  const commonProps: CommonProps = useMemo(() => {
    const colorByKey = data?.data?.reduce<Record<string, string>>((acc, item) => {
      acc[item.name] = resolveCategoryColor({ key: item.name as TaxSummarySectionType })
      return acc
    }, {})

    return {
      interactionProps: NO_OP_INTERACTION_PROPS,
      stylingProps: { colorSelector: (item: SeriesData) => ({ color: colorByKey?.[item.name] ?? 'var(--color-base-300)', opacity: 1 }) },
    }
  }, [data])

  switch (state) {
    case TaxSummaryState.NO_TRANSACTIONS:
      return <TaxEstimatesSummaryCardEmpty />
    case TaxSummaryState.NO_TAXES_OWED:
      return <TaxEstimatesSummaryCardNegativeOrZero />
    case TaxSummaryState.UNKNOWN:
    case TaxSummaryState.TAXES_OWED:
      if (mode === TaxEstimatesSummaryCardMode.HorizontalBarChart) {
        return <HorizontalBarChartContent data={data} commonProps={commonProps} />
      }
      return <PieChartContent data={data} commonProps={commonProps} layout={layout} />
  }
}

const HorizontalBarChartContent = ({ data, commonProps }: Pick<ContentProps, 'data' | 'commonProps'>) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { isDesktop } = useSizeClass()

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__Content Layer__TaxEstimatesSummaryCard__Content--horizontal' gap='md' pi='lg' pbe='lg'>
      <HStack className='Layer__TaxEstimatesSummaryCard__TotalRow' justify='space-between' align='baseline' gap='md'>
        <Span size='md' variant='subtle'>{t('common:label.total', 'Total')}</Span>
        <Span size='xl' weight='bold' numeric='tabular-nums' className='Layer__TaxEstimatesSummaryCard__TotalValue'>
          {formatCurrencyFromCents(data.total)}
        </Span>
      </HStack>
      <HorizontalBarChart<SeriesData>
        data={data}
        stylingProps={commonProps.stylingProps}
        formatValue={formatCurrencyFromCents}
        labelMode={isDesktop ? LegendLayout.Aligned : LegendLayout.Table}
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
