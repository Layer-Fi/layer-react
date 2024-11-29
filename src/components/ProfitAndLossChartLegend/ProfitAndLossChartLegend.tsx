import React from 'react'

const LEGEND_ITEMS = ['Revenue', 'Expenses', 'Uncategorized']

export const ProfitAndLossChartLegend = () => {
  return (
    <ul className='Layer__chart-legend-list'>
      {LEGEND_ITEMS.map((item, idx) => (
        <li key={item} className={`Layer__profit-and-loss__legend-item legend-item-${idx}`}>
          <svg
            className='recharts-surface'
            width='15'
            height='15'
            viewBox='0 0 15 15'
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              marginRight: 4,
            }}
          >
            <circle
              cx='7'
              cy='7'
              r='7'
            />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  )
}
