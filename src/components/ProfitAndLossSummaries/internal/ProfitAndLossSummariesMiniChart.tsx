import React from 'react'
import type { Scope } from '../../../hooks/useProfitAndLoss/useProfitAndLoss'
import type { ProfitAndLoss } from '../../../types'
import type { LineBaseItem } from '../../../types/line_item'
import {
  collectExpensesItems,
  collectRevenueItems,
} from '../../../utils/profitAndLossUtils'
import { mapTypesToColors } from '../../ProfitAndLossDetailedCharts/DetailedTable'
import { PieChart, Pie, Cell } from 'recharts'

const CHART_PLACEHOLDER: Array<LineBaseItem> = [
  {
    name: 'placeholder',
    display_name: 'placeholder',
    value: 1,
    type: 'placeholder',
    share: 1,
  },
]

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

  let items: LineBaseItem[] = []

  switch (scope) {
    case 'revenue':
      items = collectRevenueItems(data)
      break
    default:
      items = collectExpensesItems(data)
  }

  if (
    !items ||
    items.length === 0 ||
    !items.find(x => Math.abs(x.value) !== 0)
  ) {
    return CHART_PLACEHOLDER
  }

  return items.slice()
}

type ProfitAndLossMiniChartProps = {
  data: LineBaseItem[]
  chartColorsList?: string[]
}

export function ProfitAndLossSummariesMiniChart({
  data,
  chartColorsList,
}: ProfitAndLossMiniChartProps) {
  const typeColorMapping = mapTypesToColors(data, chartColorsList)

  return (
    <PieChart width={52} height={52}>
      <Pie
        data={data}
        dataKey='value'
        nameKey='name'
        cx='50%'
        cy='50%'
        innerRadius={10}
        outerRadius={16}
        paddingAngle={0.4}
        fill='#8884d8'
        width={24}
        height={24}
        animationDuration={250}
        animationEasing='ease-in-out'
      >
        {data.map((entry, index) => {
          const colorConfig = typeColorMapping[index]

          return (
            <Cell
              key={`cell-${index}`}
              className={'Layer__profit-and-loss-detailed-charts__pie'}
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
