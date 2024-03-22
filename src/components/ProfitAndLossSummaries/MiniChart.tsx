import React from 'react'
import { DEFAULT_CHART_COLORS } from '../../config/charts'
import { LineBaseItem } from '../../types/line_item'
import { PieChart, Pie, Cell } from 'recharts'

export interface MiniChartProps {
  data: LineBaseItem[]
}

export const MiniChart = ({ data }: MiniChartProps) => {
  return (
    <PieChart width={48} height={48} className='mini-chart'>
      <Pie
        data={data}
        dataKey='value'
        nameKey='name'
        cx='50%'
        cy='50%'
        innerRadius={10}
        outerRadius={16}
        paddingAngle={0.2}
        fill='#8884d8'
        width={24}
        height={24}
        animationDuration={250}
        animationEasing='ease-in-out'
      >
        {data.map((entry, index) => {
          const colorConfig =
            DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]

          return (
            <Cell
              key={`cell-${index}`}
              className={`Layer__profit-and-loss-detailed-charts__pie`}
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
