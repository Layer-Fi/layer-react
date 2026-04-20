import { useMemo } from 'react'

import { type TaxOverviewCategoryKey } from '@schemas/taxEstimates/overview'
import { VStack } from '@ui/Stack/Stack'
import { DetailedChart } from '@components/DetailedCharts/DetailedChart'
import { type DetailData, type SeriesData } from '@components/DetailedCharts/types'

import { resolveCategoryColor } from './constants'

export type TaxEstimateChartProps = {
  data: DetailData<SeriesData>
  total: number
}

export const TaxEstimateChart = ({
  data,
  total,
}: TaxEstimateChartProps) => {
  const colorByKey = useMemo(() => {
    return data.data.reduce<Record<string, string>>((acc, category) => {
      acc[category.name] = resolveCategoryColor({ key: category.name as TaxOverviewCategoryKey })
      return acc
    }, {})
  }, [data.data])

  return (
    <VStack align='center' justify='center'>
      <DetailedChart
        data={{
          data: data.data,
          total,
        }}
        interactionProps={{
          hoveredItem: undefined,
          setHoveredItem: () => {},
        }}
        stylingProps={{
          colorSelector: item => ({
            color: colorByKey[item.name] ?? 'var(--color-base-300)',
            opacity: 1,
          }),
        }}
      />
    </VStack>
  )
}
