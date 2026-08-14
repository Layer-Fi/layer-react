import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'

import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { type PnlChartLineItem } from '@utils/features/profitAndLoss/profitAndLoss'
import { mapTypesToColors } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/utils'
import { resolveProfitAndLossChartPalette } from '@features/profitAndLoss/utils'

type ProfitAndLossMiniChartProps = {
  data: PnlChartLineItem[]
  scope: Scope
  chartConfig?: ProfitAndLossChartConfig
  chartColorsList?: string[]
}

const CHART_DIMENSION = 52
const INNER_RADIUS = 10
const OUTER_RADIUS = 16

export function ProfitAndLossSummariesMiniChart({
  data,
  scope,
  chartConfig,
  chartColorsList,
}: ProfitAndLossMiniChartProps) {
  const { palette, uncategorized } = resolveProfitAndLossChartPalette(scope, chartConfig, chartColorsList)

  const chartData = useMemo(() => data.map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  }
  )),
  [data])

  const typeColorMapping = useMemo(
    () => mapTypesToColors<PnlChartLineItem>(chartData, palette, uncategorized),
    [chartData, palette, uncategorized],
  )

  return (
    <PieChart width={CHART_DIMENSION} height={CHART_DIMENSION}>
      <Pie
        data={chartData}
        dataKey='value'
        nameKey='displayName'
        cx='50%'
        cy='50%'
        innerRadius={INNER_RADIUS}
        outerRadius={OUTER_RADIUS}
        paddingAngle={0.4}
        fill='#8884d8'
        width={36}
        height={36}
        animationDuration={250}
        animationEasing='ease-in-out'
      >
        {chartData.map((entry, index) => {
          const colorConfig = typeColorMapping(entry.name)

          return (
            <Cell
              key={`cell-${index}`}
              className='Layer__DetailedChart__Slice'
              fill={
                entry.name === 'placeholder' ? '#e6e6e6' : colorConfig.color
              }
              opacity={colorConfig?.opacity}
            />
          )
        })}
      </Pie>
    </PieChart>
  )
}
