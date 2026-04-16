import { useMemo } from 'react'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'

import { resolveCategoryColor } from './constants'
import type { SummaryChartProps } from './types'

type TaxEstimateChartDataItem = {
  key: string
  name: string
  displayName: string
  value: number
}

type TaxEstimateChartProps = SummaryChartProps

export const TaxEstimateChart = ({
  categories,
  total,
}: TaxEstimateChartProps) => {
  const { formatCurrencyFromCents } = useIntlFormatter()
  const chartData = useMemo<TaxEstimateChartDataItem[]>(() => {
    if (total <= 0) return []

    return categories.map(category => ({
      key: category.key,
      name: category.key,
      displayName: category.label,
      value: Math.max(category.amount, 0),
    }))
  }, [categories, total])

  const colorByKey = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.key] = resolveCategoryColor(category)
      return acc
    }, {})
  }, [categories])

  return (
    <VStack className='Layer__TaxEstimatesSummaryCard__DonutChart' align='center' justify='center'>
      <VStack className='Layer__TaxEstimatesSummaryCard__DonutChartInner' align='center' justify='center'>
        <DetailedChart<TaxEstimateChartDataItem>
          data={{
            data: chartData,
            total,
          }}
          interactionProps={{
            hoveredItem: undefined,
            setHoveredItem: () => {},
          }}
          stylingProps={{
            valueFormatter: formatCurrencyFromCents,
            colorSelector: item => ({
              color: colorByKey[item.key] ?? 'var(--color-base-300)',
              opacity: 1,
            }),
            thickness: 'lg',
          }}
        />
      </VStack>
    </VStack>
  )
}
