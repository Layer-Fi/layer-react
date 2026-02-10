import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'

import {
  collectExpensesItems,
  collectRevenueItems,
  type PnlChartLineItem,
} from '@utils/profitAndLossUtils'
import { type Variants } from '@utils/styleUtils/sizeVariants'
import type { ProfitAndLoss } from '@hooks/useProfitAndLoss/schemas'
import type { Scope } from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { mapTypesToColors } from '@components/ProfitAndLossDetailedCharts/utils'

const CHART_PLACEHOLDER: Array<PnlChartLineItem> = [{
  name: 'placeholder',
  displayName: 'placeholder',
  isContra: false,
  value: 1,
  type: 'placeholder',
  share: 1,
  lineItems: [],
}]

export function toMiniChartData({
  scope,
  data,
}: {
  scope: Scope
  data?: ProfitAndLoss
}) {
  if (!data) {
    return CHART_PLACEHOLDER
  }

  let items: PnlChartLineItem[] = []

  switch (scope) {
    case 'revenue':
      items = collectRevenueItems(data)
      break
    default:
      items = collectExpensesItems(data)
  }

  if (
    !items
    || items.length === 0
    || !items.find(x => Math.abs(x.value) !== 0)
  ) {
    return CHART_PLACEHOLDER
  }

  return items.slice()
}

type ProfitAndLossMiniChartProps = {
  data: PnlChartLineItem[]
  chartColorsList?: string[]
  variants?: Variants
}

export function ProfitAndLossSummariesMiniChart({
  data,
  chartColorsList,
  variants,
}: ProfitAndLossMiniChartProps) {
  const chartData = useMemo(() => data.map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  }
  )),
  [data])

  const typeColorMapping = mapTypesToColors(chartData, chartColorsList)

  let chartDimension: number = 52
  let innerRadius: number = 10
  let outerRadius: number = 16
  switch (variants?.size) {
    case 'sm':
      chartDimension = 52
      innerRadius = 10
      outerRadius = 16
      break
    case 'lg':
      chartDimension = 64
      innerRadius = 12
      outerRadius = 20
      break
  }

  return (
    <PieChart width={chartDimension} height={chartDimension}>
      <Pie
        data={chartData}
        dataKey='value'
        nameKey='displayName'
        cx='50%'
        cy='50%'
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={0.4}
        fill='#8884d8'
        width={36}
        height={36}
        animationDuration={250}
        animationEasing='ease-in-out'
      >
        {chartData.map((entry, index) => {
          const colorConfig = typeColorMapping[index]
          if (!colorConfig) return null

          return (
            <Cell
              key={`cell-${index}`}
              className='Layer__profit-and-loss-detailed-charts__pie'
              fill={
                entry.name === 'placeholder' ? '#e6e6e6' : colorConfig.color
              }
              opacity={colorConfig.opacity}
            />
          )
        })}
      </Pie>
    </PieChart>
  )
}
