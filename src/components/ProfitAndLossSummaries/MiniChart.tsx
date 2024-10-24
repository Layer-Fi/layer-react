import React from 'react'
import { DEFAULT_MINICHART_COLORS } from '../../config/charts'
import { LineBaseItem } from '../../types/line_item'
import { mapTypesToColors } from '../ProfitAndLossDetailedCharts/DetailedTable'
import { PieChart, Pie, Cell } from 'recharts'

export interface MiniChartProps {
  data: LineBaseItem[]
  chartColorsList?: string[]
}

export const MiniChart = ({ data, chartColorsList }: MiniChartProps) => {
  const typeColorMapping = mapTypesToColors(data, chartColorsList)

  return (
    <PieChart width={52} height={52} className='mini-chart'>
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
