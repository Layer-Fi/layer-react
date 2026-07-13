import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'

import { type PnlChartLineItem } from '@utils/profitAndLossUtils'
import { mapTypesToColors } from '@components/ProfitAndLossDetailedCharts/utils'

type ProfitAndLossMiniChartProps = {
  data: PnlChartLineItem[]
  chartColorsList?: string[]
}

const CHART_DIMENSION = 52
const INNER_RADIUS = 10
const OUTER_RADIUS = 16

export function ProfitAndLossSummariesMiniChart({
  data,
  chartColorsList,
}: ProfitAndLossMiniChartProps) {
  const chartData = useMemo(() => data.map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  }
  )),
  [data])

  const typeColorMapping = useMemo(() => mapTypesToColors<PnlChartLineItem>(chartData, chartColorsList), [chartData, chartColorsList])

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
