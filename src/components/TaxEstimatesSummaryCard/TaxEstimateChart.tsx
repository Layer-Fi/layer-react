import { useMemo } from 'react'

import { type TaxOverviewCategory } from '@schemas/taxEstimates/overview'
import { VStack } from '@ui/Stack/Stack'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'

import { resolveCategoryColor } from './constants'

type TaxEstimateChartDataItem = {
  key: string
  name: string
  displayName: string
  value: number
}
export type TaxEstimateChartProps = {
  categories: readonly TaxOverviewCategory[]
  total: number
}

export const TaxEstimateChart = ({
  categories,
  total,
}: TaxEstimateChartProps) => {
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
    <VStack align='center' justify='center'>
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
          colorSelector: item => ({
            color: colorByKey[item.key] ?? 'var(--color-base-300)',
            opacity: 1,
          }),
        }}
      />
    </VStack>
  )
}
