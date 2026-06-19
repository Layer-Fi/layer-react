import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'

import { type PnlChartLineItem } from '@utils/profitAndLossUtils'
import { type Variants } from '@utils/styleUtils/sizeVariants'
import { mapTypesToColors } from '@components/ProfitAndLossDetailedCharts/utils'

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

  const typeColorMapping = useMemo(() => mapTypesToColors<PnlChartLineItem>(chartData, chartColorsList), [chartData, chartColorsList])

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
