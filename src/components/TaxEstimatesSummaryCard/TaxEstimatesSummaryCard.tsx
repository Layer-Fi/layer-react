import { useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'
import { type DetailData, type SeriesData } from '@components/DetailedCharts/types'
import { NoOpHoverInteractionProps } from '@components/DetailedCharts/utils'
import { DetailedTable } from '@components/DetailedTable/DetailedTable'
import { resolveCategoryColor } from '@components/TaxEstimatesSummaryCard/constants'

import './taxEstimatesSummaryCard.scss'

const useTaxEstimatesSummaryCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { data: taxSummaryData } = useTaxSummary({
    year,
    fullYearProjection,
    enabled: true,
  })

  return {
    categories: taxSummaryData?.sections.map((section, index) => ({
      amount: section.taxesOwed,
      color: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
      key: section.type,
      label: section.label,
    })) ?? [],
    layout: isDesktop ? 'taxOverview' as const : 'summaryCard' as const,
    title: t('taxEstimates:label.tax_summary', 'Tax Summary'),
    total: taxSummaryData?.projectedTaxesOwed ?? 0,
  }
}

export type TaxEstimatesSummaryCardProps = {
  categories: readonly TaxOverviewCategory[]
  layout?: 'taxOverview' | 'summaryCard'
  title: string
  total: number
}

export const TaxEstimatesSummaryCard = () => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const { categories, layout, title, total } = useTaxEstimatesSummaryCard()
  const isSummaryCardLayout = layout === 'summaryCard'

  const data: DetailData<SeriesData> = useMemo(() => {
    if (total <= 0) return { data: [], total: 0 }

    const shortenedDisplayName = (key: string) => {
      return key === 'federal' ? t('taxEstimates:label.federal', 'Federal') : t('taxEstimates:label.state', 'State')
    }

    return {
      data: categories.map(category => ({
        value: Math.max(category.amount, 0),
        name: category.key,
        displayName: isMobile ? shortenedDisplayName(category.key) : category.label,
      })),
      total,
    }
  }, [categories, total, isMobile, t])

  const colorByKey = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.key] = resolveCategoryColor(category)
      return acc
    }, {})
  }, [categories])

  const StylingProps = useMemo(() => ({
    colorSelector: (item: SeriesData) => ({
      color: colorByKey[item.name] ?? 'var(--color-base-300)',
      opacity: 1,
    }),
  }), [colorByKey])

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
                <DetailedChart<SeriesData>
                  data={data}
                  interactionProps={NoOpHoverInteractionProps}
                  stylingProps={StylingProps}
                />
                <DetailedTable<SeriesData>
                  data={data}
                  interactionProps={NoOpHoverInteractionProps}
                  stylingProps={StylingProps}
                  sortParams={{ sortBy: 'value' }}
                  sortFunction={() => {}}
                />
              </VStack>
            )
            : (
              <HStack className='Layer__TaxEstimatesSummaryCard__Content' align='center' gap='lg'>
                <DetailedChart
                  data={data}
                  interactionProps={NoOpHoverInteractionProps}
                  stylingProps={StylingProps}
                />
                <DetailedTable<SeriesData>
                  data={data}
                  interactionProps={NoOpHoverInteractionProps}
                  stylingProps={StylingProps}
                  sortParams={{ sortBy: 'value' }}
                  sortFunction={() => {}}
                />
              </HStack>
            )}
        </VStack>
      </Card>
    </VStack>
  )
}
